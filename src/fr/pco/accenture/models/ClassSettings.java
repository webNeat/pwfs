package fr.pco.accenture.models;

import java.util.List;

public class ClassSettings {
	private List<String> filters;
	private List<String> separators;

	public ClassSettings(){}
	public ClassSettings(List<String> filters, List<String> separators){
		this.filters = filters;
		this.separators = separators;
	}

	public List<String> getFilters(){
		return filters;
	}
	public void setFilters(List<String> filters){
		this.filters = filters;
	}
	public List<String> getSeparators(){
		return separators;
	}
	public void setSeparators(List<String> separators){
		this.separators = separators;
	}
}
