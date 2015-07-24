package fr.pco.accenture.models;

import java.util.Map;

public class Instance {
	private String name;
	private String className;
	private Map<String,Object> values;

	public Instance(){}
	public Instance(String name, String className, Map<String,Object> values){
		this.name = name;
		this.className = className;
		this.values = values;
	}

	public String getName(){
		return name;
	}
	public void setName(String name){
		this.name = name;
	}
	public String getClassName(){
		return className;
	}
	public void setClassName(String className){
		this.className = className;
	}
	public Map<String,Object> getValues(){
		return values;
	}
	public void setValues(Map<String,Object> values){
		this.values = values;
	}
}
