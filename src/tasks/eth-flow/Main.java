import java.io.*;
import java.net.*;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.json.JSONArray;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;


public class Main {
    public static final String ICO_COMING = "ICO coming", ICO_OVER = "ICO over", TRADING = "Trading", ICO_RUNNING = "ICO running",
                                TX_BASE_URL = "https://etherscan.io/txs?a=%s&sort=value&order=desc&p=%s",
                                RICH_LIST_PATH ="result/rich_list/", ABNORMAL_FILE_PATH="result/abnormal/";
    public static final int MAX_COUNT = 100, MAX_PAGE_NUM = 200, ZERO_TX_THRESHOLD = 10;

    private static Logger log = Logger.getAnonymousLogger();

    private static void fetchAllRichList() throws IOException{
        String content = new Scanner(new File("ico.json")).useDelimiter("\\Z").next();

        JSONArray icoList = new JSONArray(content);
        JSONArray icoRichList = new JSONArray();
        log.log(Level.INFO, "ICO total number: " + icoList.length());

        for (int i = 0; i < icoList.length(); i++){
            JSONObject icoItem = icoList.getJSONObject(i);
//            log.log(Level.INFO, "fetching ICO " + icoItem.get("name") + " status: " + icoItem.get("status"));
//            for (String key: icoItem.keySet()) {
//                System.out.println(key + "\t" + icoItem.get(key).toString());
//            }
            // for each ICO, fetch according to the contract address
            // it will be better if there is an accurate start time and end time
            // if the status is ICO comming, ignore it
            // if the address is empty, ignore it too
            // parse the address field
            String addrs = icoItem.get("address").toString().trim();
            addrs = addrs.substring(1, addrs.length()-1);
            if (addrs.equals("") || icoItem.get("status").toString().equals("ICO coming"))
                continue;
            String[] addrList = addrs.replace("\"", "").split(",");
            Map<String, Double> richList = new LinkedHashMap<>();

            for (String addr: addrList) {
                if (addrParsed(addr))
                    continue;
                try {
                    System.out.println("parsing "+icoItem.get("name")+":" + addr);
                    richList.putAll(parseContract(addr));
                } catch (NullPointerException e) {
                    continue;
                }
            }
            icoRichList.put((new JSONObject()).put(icoItem.get("name").toString(), richList));
        }
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream("ico-rich-list.json")));
        icoRichList.write(bw);
        bw.flush();
        bw.close();
    }

    // return the first 100 richest
    private static Map<String, Double> parseContract(String addr) throws IOException {
        // get all transactions sending to the contract address
        // parse those successful and for ico
        // return all from address and its ico value towards the contract
        BufferedWriter detailWriter = new BufferedWriter(new OutputStreamWriter(new FileOutputStream("result/rich_list/detail/"+addr)));
        Map<String, Double> richList = new LinkedHashMap<>();
        int count = 0, page=1, zeroCount = 0;
        boolean allZero = true, validPage = true;
        while (count < MAX_COUNT && validPage) {
            if (page >= MAX_PAGE_NUM){
                log.log(Level.SEVERE, "Too many pages for " + addr + "\nPlease parse again with time");
                break;
            }
            String url = String.format(TX_BASE_URL, addr, page);
            String html = readPage(url);
            if (html == null || html.equals(""))
                break;
//            Document doc = Jsoup.parse(new Scanner(new File("test.html")).useDelimiter("\\Z").next());
            Document doc = Jsoup.parse(html);
            Element table = doc.getElementsByClass("table-hover").first();
            for (Element tr : table.child(1).children()) {
                if (tr.text().equals("") || tr.child(0).text().equals("")) {
                    validPage = false;
                    break;
                }
                if (!tr.child(0).child(0).tagName().equals("font")) { //ignore invalid transaction
                    //0-tx hash, 1-block, 2-age, 3-from addr, 4-in or out, 5-to addr, 6-amount, 7-tx fee
                    if (!tr.child(4).text().contains("IN"))
                        break;
                    if (tr.child(5).text().contains("Contract Creation"))
                        break;
                    long block = Integer.parseInt(tr.child(1).text());
                    String senderAddr = tr.child(3).text();
//                    if (!senderAddr.startsWith("0x")) {
//                        senderAddr += "-" + tr.child(3).child(0).attr("href").split("/")[2];
//                    }
                    String amount = tr.child(6).text();
                    double ether;
                    if (amount.contains("wei")) {
                        double wei = Double.parseDouble(amount.replace(",", "").replace("wei", "").trim());
                        ether = wei * Math.pow(10, -18);
//                        log.info("wei - " + ether);
                    }else
                        ether = Double.parseDouble(amount.replace(",", "").replace("Ether", "").trim());
                    if (ether != 0.0) {
                        allZero = false;
                        detailWriter.write(block+"\t"+senderAddr+"\t"+ether+"\n");
                    }else
                        zeroCount++;
                    if (richList.containsKey(senderAddr))
                        richList.put(senderAddr, ether+richList.get(senderAddr));
                    else {
                        richList.put(senderAddr, ether);
                        count++;
                    }
                }
            }
            detailWriter.flush();
            System.out.println("count: "+count);
            page++;
        }
        detailWriter.close();
        String filename = "";
        if (allZero) { // || zeroCount > ZERO_TX_THRESHOLD
            log.log(Level.WARNING, "Too many zero transactions in " + addr);
            filename = ABNORMAL_FILE_PATH + addr;
        }else
            filename = RICH_LIST_PATH + addr;
        if (richList.size() > 0) {
            BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(filename)));
            for (Map.Entry<String, Double> e : richList.entrySet())
                bw.write(e.getKey() + "\t" + e.getValue() + "\n");
            bw.flush();
            bw.close();
        }else{
            log.log(Level.SEVERE, "Abnormal address: " + addr);
        }
//            System.out.println("All amount are zero in "+addr);
//        for (Map.Entry<String, Double> e : richList.entrySet())
//            bw.write(e.getKey() + "\t" + e.getValue() + "\n");
//        bw.flush();
//        bw.close();
        return richList;
    }

    private static boolean addrParsed(String addr) {
        return (new File(ABNORMAL_FILE_PATH + addr)).exists() || (new File(RICH_LIST_PATH + addr)).exists();
    }

    public static void main(String[] args) throws IOException {
        fetchAllRichList();
//        Map<String, Double> map = parseContract("0x0D8775F648430679A709E98d2b0Cb6250d2887EF");
//        analyzeAccount("0x5ed8cee6b63b1c6afce3ad7c92f4fd7e1b8fad9f");
//        analyzeAccount("0xf39d30fa570db7940e5b3a3e42694665a1449e4b", 0);
    }

    public static String readPage(String url) throws IOException {
//        String url = "https://etherscan.io/vmtrace?txhash=0x358a4847649beed12eaf1715966320dc385e925ceb57ed4dcc62d98e48c39025&type=parity";
//        String url2 = "https://etherscan.io/txs?a=0x4f529990b7f3d1fb4152736155e431c96fd86294&p=1";
        System.out.println("reading "+url);
        int timeout = 3000;
        HttpURLConnection conn = (HttpURLConnection) (new URL(url)).openConnection();
        conn.setConnectTimeout(timeout);
        conn.setReadTimeout(5000);
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36");
        //conn.usingProxy();
        int rs = conn.getResponseCode();
        if (rs == 200 || rs == 304) {
            String html = new Scanner(conn.getInputStream()).useDelimiter("\\Z").next();
//            OutputStreamWriter osw = new OutputStreamWriter(new FileOutputStream(new File("test.html")));
//            osw.write(html);
//            osw.close();
            System.out.println("reading page done with response code: " + rs);
            return html;
        } else {
            System.out.println("something wrong with the page: " + rs);
            return null;
        }
    }

    private static final String ACCOUNT_TX_PATH = "result/account/";
    private static final int MAX_BACKTRACK = 5;

    // analyze accounts who send more than epsilon ether to the ICO contract
    // analyze only transactions before the ICO
    private static Map<String, Double> analyzeAccount(String account, long blockNo) throws IOException {
        JSONArray intx = new JSONArray(), outtx = new JSONArray();
//        Set<String> senders = new HashSet<>(), receivers = new HashSet<>();
        Map<String, Double> senders = new HashMap<>(), receivers = new HashMap<>();

        // determine whether it's a miner
        String queryUrl = "https://etherchain.org/api/account/%s/mined";
        String json = new Scanner((new URL(String.format(queryUrl, account))).openConnection().getInputStream()).useDelimiter("\\Z").next();
        JSONObject minerQeury = new JSONObject(json);
        if (minerQeury.getJSONArray("data").length() != 0){
            log.severe(account + " is a miner");
            return null;
        }

        int max_page = 200, max_sender = 50; // read no more than 1000 transactions or no more than 50 senders
        int page = 0;
        double epsilon = 0.0000001, inTotal = 0.0, outTotal = 0.0;
        while (page < max_page && senders.size() < max_sender) {
            page++;
            String url = "https://etherscan.io/txs?a=%s&sort=value&order=desc&p=%s";
            String html = readPage(String.format(url, account, page));
            Document doc = Jsoup.parse(html);
            Elements trs = doc.select(".table-hover tbody tr");
            if (trs.isEmpty())
                break;
            if (trs.size() == 1 || trs.first().children().size() < 7)
                break;
            for (Element tr : trs) {
                // 0-tx hash, 1 - block, 2-time, 3-from, 4-type, 5-to, 6-value, 7-tx fee
                long txBlock = Integer.parseInt(tr.child(1).text());
                if (txBlock > blockNo)
                    continue;
                String txType = tr.child(4).text();
                TxFlow flow = txType.equals("OUT") ? TxFlow.OUT : TxFlow.IN;
                String amount = tr.child(6).text().toLowerCase();
                if (amount.contains("wei")) // ignore small transactions
                    continue;
                double ether = Double.parseDouble(amount.replace("ether", "").replace(",", "").trim());
                if (ether <= epsilon) // ignore small transactions
                    continue;
                String senderAddr = tr.child(3).text(), receiverAddr = tr.child(5).text();

//                Transaction tx = new Transaction(tr.child(0).text(), blockNo, senderAddr, receiverAddr, flow, ether);

                if (flow == TxFlow.IN) {
                    // where is the money from - senders and amount pair
                    if (senders.containsKey(senderAddr))
                        senders.put(senderAddr, senders.get(senderAddr)+ether);
                    else
                        senders.put(senderAddr, ether);
//                    intx.put(tx.toJSON());
                    inTotal += ether;
                } else {
//                    receivers.add(tr.child(5).text());
//                    outtx.put(tx.toJSON());
                    outTotal += ether;
                }
            }
        }
        if (page == max_page || senders.size() == max_sender){
            log.severe("too many transaction, this address may be a pool or market");
            return senders;
        }else{ // analyze sender address
//            senders.put("total", inTotal);
            return senders;
        }
//        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(ACCOUNT_TX_PATH+account)));
//        JSONObject obj = new JSONObject();
//        obj.put("inTotal", inTotal);
//        obj.put("outTotal", outTotal);
//        obj.put("in", intx);
//        obj.put("out", outtx);
//        obj.write(bw);
//        bw.flush();
//        bw.close();
    }

    private static JSONObject analyzeICO(String addr) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream("/rich_list/detail/"+addr)));
        String line = "";
        int max_backtrace = 10;
        while ((line = br.readLine()) != null){
            String[] info = line.split("\t");
            long block = Long.parseLong(info[0]);
            String account = info[1];
            double ether = Double.parseDouble(info[2]);

            int backtrace = 0;
            JSONObject trace = new JSONObject();
            while (backtrace < max_backtrace) {
                Map<String, Double> senders = analyzeAccount(account, block);
                if (senders == null || (senders.containsKey("total") && senders.size() == 1)) { // the account is a miner
                    trace.put("senders", "");
                    break;
//                } else if (!senders.containsKey("total")){
//                    trace.put("senders", new JSONObject(senders));
//                    break;
                }else{
                    trace.put("senders", new JSONObject(senders));
                    for (String senderAddr: senders.keySet()){
                        trace.put(senderAddr, analyzeICO(senderAddr));
                    }
                }
//                trace.put(String.valueOf(backtrace), initial);

            }
        }
        return null;
    }
}
