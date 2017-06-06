import java.io.*;
import java.net.*;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.json.JSONArray;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;


public class Main {
    public static final String ICO_COMING = "ICO coming", ICO_OVER = "ICO over", TRADING = "Trading", ICO_RUNNING = "ICO running",
    TX_BASE_URL = "https://etherscan.io/txs?a=%s&sort=value&order=desc&p=%s",
    BASE_FILE_PATH="rich_list/";
    public static final int MAX_COUNT = 100, MAX_PAGE_NUM = 300;
    private static Logger log = Logger.getAnonymousLogger();

    private static void getContractAddr() throws IOException{
        String content = new Scanner(new File("ico.json")).useDelimiter("\\Z").next();

        JSONArray icoList = new JSONArray(content);

        JSONArray icoRichList = new JSONArray();
        log.log(Level.INFO, "ICO total number: " + icoList.length());
        for (int i = 0; i < icoList.length(); i++){
            JSONObject icoItem = icoList.getJSONObject(i);
            for (String key: icoItem.keySet()) {
                System.out.println(key + "\t" + icoItem.get(key).toString());
            }
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
            Map<String, Double> richList = new HashMap<>();
            for (String addr: addrList) {
                if ((new File(BASE_FILE_PATH+addr)).exists())
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
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream("ico_rich_list.json")));
        icoRichList.write(bw);
        bw.flush();
        bw.close();
    }

    // return the first 100 richest
    private static Map<String, Double> parseContract(String addr) throws IOException {
        // get all transactions sending to the contract address
        // parse those successful and for ico
        // return all from address and its ico value towards the contract
        Map<String, Double> richList = new LinkedHashMap<>();
        int count = 0, page=1;
        boolean allZero = true, validPage = true;
        while (count < MAX_COUNT && validPage) {
            if (page >= MAX_PAGE_NUM){
                log.log(Level.SEVERE, "Too many pages for " + addr);
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
                    String senderAddr = tr.child(3).text();
                    String amount = tr.child(6).text();
                    double ether = Double.parseDouble(amount.replace(",", "").replace("Ether", "").trim());
//                    System.out.println(senderAddr + "\t" + ether);
                    // for special sender address
//                    if (!senderAddr.startsWith("0x")){
//                        senderAddr += "-" + tr.child(3).attr("href").replace("/address/", "");
//                        log.log(Level.WARNING, "special address " + senderAddr);
//                    }
                    if (ether != 0.0)
                        allZero = false;
                    if (richList.containsKey(senderAddr))
                        richList.put(senderAddr, ether+richList.get(senderAddr));
                    else {
                        richList.put(senderAddr, ether);
                        count++;
                    }
                }
            }
            System.out.println("count: "+count);
            page++;
        }
        System.out.println("count: "+count);
        if (allZero)
            log.log(Level.SEVERE, "All amount are zero in "+addr);
        if (richList.size() != 0) {
            BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(BASE_FILE_PATH + addr)));
            for (Map.Entry<String, Double> e : richList.entrySet())
                bw.write(e.getKey() + "\t" + e.getValue() + "\n");
            bw.flush();
            bw.close();
        }
        return richList;
    }

    public static void main(String[] args) throws IOException {
        getContractAddr();
//        Map<String, Double> map = parseContract("0x0D8775F648430679A709E98d2b0Cb6250d2887EF");
    }

    private static String readPage(String url) throws IOException {
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
        if (rs == 200 || rs == 304){
            String html = new Scanner(conn.getInputStream()).useDelimiter("\\Z").next();
            OutputStreamWriter osw = new OutputStreamWriter(new FileOutputStream(new File("test.html")));
            osw.write(html);
            osw.close();
            System.out.println("reading page done with response code: " + rs);
            return html;
        }else{
            System.out.println("something wrong with the page: " + rs);
            return null;
        }
    }
}
