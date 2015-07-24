package fr.pco.accenture.models;

import java.util.List;

public class Class {
	private String name;
	private List<String> childs;
	private List<String> instances;
	private List<Property> properties;
	private ClassSettings setts;

	public Class(){}
	public Class(String name, List<String> childs, List<String> instances, List<Property> properties, ClassSettings setts){
		this.name = name;
		this.childs = childs;
		this.instances = instances;
		this.properties = properties;
		this.setts = setts;
	}

	public String getName(){
		return name;
	}
	public void setName(String name){
		this.name = name;
	}
	public List<String> getChilds(){
		return childs;
	}
	public void setChilds(List<String> childs){
		this.childs = childs;
	}
	public List<String> getInstances(){
		return instances;
	}
	public void setInstances(List<String> instances){
		this.instances = instances;
	}
	public List<Property> getProperties(){
		return properties;
	}
	public void setProperties(List<Property> properties){
		this.properties = properties;
	}
	public ClassSettings getSetts(){
		return setts;
	}
	public void setSetts(ClassSettings setts){
		this.setts = setts;
	}
}
