package com.activiti6.utils;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.util.Map;

public class HttpClientHelper {
    /**
     * 使用URLConnection实现GET请求
     *
     * 1.实例化一个java.net.URL对象； 2.通过URL对象的openConnection()方法得到一个java.net.URLConnection;
     * 3.通过URLConnection对象的getInputStream()方法获得输入流； 4.读取输入流； 5.关闭资源；
     */
    public static void get(String urlStr) throws Exception
    {

        URL url = new URL(urlStr);
        URLConnection urlConnection = url.openConnection(); // 打开连接

        System.out.println(urlConnection.getURL().toString());

        BufferedReader br = new BufferedReader(new InputStreamReader(urlConnection.getInputStream(), "utf-8")); // 获取输入流
        String line = null;
        StringBuilder sb = new StringBuilder();
        while ((line = br.readLine()) != null)
        {
            sb.append(line + "\n");
        }
        br.close();
        System.out.println(sb.toString());
    }

    /**
     * 使用HttpURLConnection实现POST请求
     *
     * 1.实例化一个java.net.URL对象； 2.通过URL对象的openConnection()方法得到一个java.net.URLConnection;
     * 3.通过URLConnection对象的getOutputStream()方法获得输出流； 4.向输出流中写数据； 5.关闭资源；
     */
    public static void post(String urlStr, Map<String, String> parameterMap) throws IOException
    {

        URL url = new URL(urlStr);
        HttpURLConnection httpURLConnection = (HttpURLConnection) url.openConnection();

        httpURLConnection.setDoInput(true);
        httpURLConnection.setDoOutput(true); // 设置该连接是可以输出的
        httpURLConnection.setRequestMethod("POST"); // 设置请求方式
        httpURLConnection.setRequestProperty("charset", "utf-8");

        //System.out.println(httpURLConnection.getURL().toString());

        PrintWriter pw = new PrintWriter(new BufferedOutputStream(httpURLConnection.getOutputStream()));

        StringBuffer parameter = new StringBuffer();
        parameter.append("1=1");
        for (Map.Entry<String, String> entry : parameterMap.entrySet())
        {
            parameter.append("&" + entry.getKey() + "=" + entry.getValue());
        }
        pw.write(parameter.toString());// 向连接中写数据（相当于发送数据给服务器）

        pw.flush();
        pw.close();

        //System.out.println("parameter: " + parameter.toString());

        BufferedReader br = new BufferedReader(new InputStreamReader(httpURLConnection.getInputStream(), "utf-8"));
        String line = null;
        StringBuilder sb = new StringBuilder();
        while ((line = br.readLine()) != null)
        { // 读取数据
            sb.append(line + "\n");
        }
        br.close();
        //System.out.println(sb.toString());
    }
}
