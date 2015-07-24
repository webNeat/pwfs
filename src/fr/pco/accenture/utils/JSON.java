package fr.pco.accenture.utils;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import com.google.gson.Gson;

public class JSON {
	
	private static Gson serializer = new Gson();

//	public static Object read(String path, Class<?> classType) throws JsonIOException, JsonSyntaxException, FileNotFoundException{
//		Object result = null;
//		File file = new File(path);
//		if(file.exists()){
//			Type type = new TypeToken<classType>() {}.getType();
//			result = serializer.fromJson(new FileReader(file), type);
//		}
//		return result;
//	}

	public static void write(Object obj, String path) throws IOException{
		File file = new File(path);
		file.getParentFile().mkdirs();
		BufferedWriter out = new BufferedWriter(new FileWriter(file));
		out.write(serializer.toJson(obj));
		out.close();
	}

}
