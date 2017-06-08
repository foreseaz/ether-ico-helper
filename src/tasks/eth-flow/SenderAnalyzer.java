import javafx.util.Pair;
import org.json.JSONArray;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;

/**
 * Created by lss on 17-6-6.
 */
public class SenderAnalyzer {

    public static void getSenders(String addr, long startBlock, String icoAddr, double icoAmount) throws IOException {
        if ((new File("result/senders/"+addr)).exists())
            return;

        JSONObject save = new JSONObject();
        JSONObject ini = new JSONObject();
        ini.put("address", addr);
        ini.put("amount", icoAmount);
        ini.put("block", startBlock);
        save.put(icoAddr, (new JSONArray()).put(ini));

//        Queue<Pair<String, Long>> queue = new LinkedList<>();
//        queue.add(new Pair<>(addr, startBlock));
        Queue<String> addrQ = new LinkedList<>();
        Queue<Long> blockQ = new LinkedList<>();
        addrQ.add(addr);
        blockQ.add(startBlock);
        List<String> parsed = new ArrayList<>();

        while (!addrQ.isEmpty() && !blockQ.isEmpty()){
//            Pair<String, Long> account = queue.remove();
//            String accountAddr = account.getKey();
//            long block = account.getValue();
            String accountAddr = addrQ.remove();
            long block = blockQ.remove();

            if (parsed.contains(accountAddr) || !accountAddr.startsWith("0x"))
                continue;

            String queryUrl = "https://etherchain.org/api/account/%s/mined";
            String json = Main.readPage(String.format(queryUrl, accountAddr));
            JSONObject minerQeury = new JSONObject(json);
            if (minerQeury.getJSONArray("data").length() != 0){
                System.out.println(accountAddr + " is a miner");
                // addr:[]
                save.put(accountAddr, new JSONArray());
                continue;
            }

            System.out.println(accountAddr);
            // addr: [{sender:--,amount:--,block:--},{},...,{}]
            JSONArray senderList = new JSONArray();
//            List<Pair<String, Long>> tmpList = new ArrayList<>();
            int page = 0, max_page = 50, max_sender = 10;
            double epsilon = 0.0000001;
            while (page < max_page && senderList.length() < max_sender) {
                page++;
                String url = "https://etherscan.io/txs?a=%s&sort=value&order=desc&p=%s";
                String html = Main.readPage(String.format(url, accountAddr, page));
                Document doc = Jsoup.parse(html);
                Elements trs = doc.select(".table-hover tbody tr");
                if (trs.isEmpty())
                    break;
                if (trs.size() == 1 || trs.first().children().size() < 7)
                    break;
                for (Element tr : trs) {
                    // 0-tx hash, 1 - block, 2-time, 3-from, 4-type, 5-to, 6-value, 7-tx fee
                    long txBlock = Integer.parseInt(tr.child(1).text());
                    if (txBlock > block)
                        continue;
                    String txType = tr.child(4).text();
                    if (txType.equals("OUT"))
                        continue;
                    String amount = tr.child(6).text().toLowerCase();
                    if (amount.contains("wei")) // ignore small transactions
                        continue;
                    double ether = Double.parseDouble(amount.replace("ether", "").replace(",", "").trim());
                    if (ether <= epsilon) // ignore small transactions
                        continue;
                    String senderAddr = tr.child(3).text();

                    boolean duplicate = false;
                    for (int i = 0; i < senderList.length(); i++){
                        JSONObject tmp = senderList.getJSONObject(i);
                        if (tmp.getString("address").equals(senderAddr)){
                            tmp.put("amount", tmp.getDouble("amount")+ether);
                            tmp.put("block", Math.max(tmp.getLong("block"), txBlock));
                            duplicate = true;
                        }
                    }
                    if (!duplicate) {
                        JSONObject senderInfo = new JSONObject();
                        senderInfo.put("address", senderAddr);
                        senderInfo.put("amount", ether);
                        senderInfo.put("block", txBlock);
                        senderList.put(senderInfo);
                    }
//                    tmpList.add(new Pair<>(senderAddr, txBlock));
                }
            }
            parsed.add(accountAddr);
            System.out.println(senderList.toString());
            if (page >= max_page || senderList.length() >= max_sender)
                save.put(accountAddr, new JSONArray());
            else {
                save.put(accountAddr, senderList);
                for (int i = 0; i < senderList.length(); i++){
                    String tmpAddr = senderList.getJSONObject(i).getString("address");
                    if (!addrQ.contains(tmpAddr)){
                        addrQ.add(tmpAddr);
                        blockQ.add(senderList.getJSONObject(i).getLong("block"));
                    }
                }
            }
            System.out.println(addrQ.toString());
        }
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream("result/senders/"+addr)));
        save.write(bw);
        bw.flush();
        bw.close();
    }

    public static void main(String[] args) throws IOException {
        String contractAddr = "0x0D8775F648430679A709E98d2b0Cb6250d2887EF";
        BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream("result/rich_list/detail/"+contractAddr)));
        String line = "";
        while ((line = br.readLine()) != null){
            String[] tmp = line.split("\t");
            long block = Long.parseLong(tmp[0]);
            String addr = tmp[1];
            double ether = Double.parseDouble(tmp[2].replace(",", "").replace("Ether", "").trim());
            getSenders(addr, block, contractAddr, ether);
        }
//        getSenders("0xF39d30Fa570db7940e5b3A3e42694665A1449E4B", 3798640);
    }
}
