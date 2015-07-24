package fr.pco.accenture.factories;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import edu.stanford.smi.protegex.owl.model.OWLIndividual;
import edu.stanford.smi.protegex.owl.model.OWLModel;
import edu.stanford.smi.protegex.owl.model.RDFProperty;
import fr.pco.accenture.models.Instance;
import fr.pco.accenture.utils.Helper;

public class InstancesFactory {
	private static Map<String, Map<String, Instance>> instances;

	public static void init() {
		instances = new HashMap<String, Map<String, Instance>>();
		loadAll();
	}

	public static void loadAll() {
		for(String name : ModelsFactory.getNames()){
			load(name);
		}
	}

	public static boolean has(String modelName){
		return instances.containsKey(modelName);
	}

	public static boolean has(String modelName, String instanceName){
		return (instances.containsKey(modelName) && instances.get(modelName) != null && instances.get(modelName).containsKey(instanceName));
	}

	public static void load(String modelName) {
		if(! has(modelName))
			instances.put(modelName, new HashMap<String, Instance>());
		for(String className : ClassesFactory.getNames(modelName))
			for(String instanceName : ClassesFactory.get(modelName, className).getInstances())
				load(modelName, className, instanceName);
	}

	public static Instance load(String modelName, String className, String instanceName) {
		OWLModel model = ModelsFactory.get(modelName);
		if(model == null)
			return null;
		Helper helper = new Helper(model);
		Map<String, Object> values = new HashMap<String, Object>();
		OWLIndividual individual = model.getOWLIndividual(instanceName);
		for(RDFProperty p : helper.getProperties(className))
			values.put(p.getName(), individual.getPropertyValues(p));
		Instance instance = new Instance(instanceName , className, values);
		instances.get(modelName).put(instanceName, instance);
		return instance;
	}

	public static Instance get(String modelName, String instanceName) {
		if(has(modelName, instanceName))
			return instances.get(modelName).get(instanceName);
		return null;
	}

	public static Set<String> getNames(String modelName) {
		if(has(modelName))
			return instances.get(modelName).keySet();
		return null;
	}

}
