package fr.pco.accenture.http;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import com.google.gson.Gson;

import fr.pco.accenture.factories.ClassesFactory;
import fr.pco.accenture.factories.InstancesFactory;
import fr.pco.accenture.factories.ModelsFactory;
import fr.pco.accenture.factories.ProjectsFactory;
import fr.pco.accenture.handler.Handler;
import fr.pco.accenture.utils.Files;

/**
 * Servlet implementation class Controller
 */
@WebServlet("/api/*") // L'URL reliée à la Servlet
@MultipartConfig // Pour supporter l'upload des fichiers
public class Controller extends HttpServlet {
	private static final long serialVersionUID = 1L;

    private Map< String, String[]> params;
    private Handler handler;
    private Gson serializer;
    /**
     * Constructeur par défaut
     * @see HttpServlet#HttpServlet()
     */
    public Controller() {
        super();
    }

    /**
     * Initialisation de la Servlet
	 * @see HttpServlet#init(ServletConfig config)
     */
    public void init(ServletConfig config) throws ServletException {
		try {
			// Initialisation des factories
			Files.setProjectsPath(config.getServletContext().getRealPath("WEB-INF/projects"));
			ModelsFactory.init();
			ProjectsFactory.init();
			ClassesFactory.init();
			InstancesFactory.init();
		} catch (IOException e) {
			e.printStackTrace();
		}
		handler = new Handler();
		serializer = new Gson();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String uri = initURIAndParams(request);
		Object result = null;
		switch(uri){
			case "projects":
				result = handler.getProjects();
			break;
			case "classes":
				result = handler.getClasses();
			break;
			case "instances":
				result = handler.getInstances();
			break;
			case "class-settings":
				result = handler.getClassSettings();
			break;
			case "instance":
				result = handler.getInstance();
			break;
		}
		response.setContentType("application/json");
		response.getWriter().write(serializer.toJson(result));
		response.getWriter().flush();
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String uri = initURIAndParams(request);
		Object result = null;

		switch(uri){
			case "projects": // add a new project
				String name = request.getParameter("name");
				Part[] files = new Part[3];
				files[0] = request.getPart("file1");
				files[1] = request.getPart("file2");
				files[2] = request.getPart("file3");
				result = handler.addProject(name, files);
			break;
			case "values":
				result = handler.saveValue();
			break;
			case "instances":
				if(request.getParameter("action").equals("create"))
					result = handler.addInstance();
				else
					result = handler.removeInstance();
			break;
			case "class-settings":
				result = handler.saveClassSettings();
			break;
			// case "property-settings":
			// 	result = handler.savePropertySettings();
			// break;
			// case "project-settings":
			// 	result = handler.saveProjectSettings();
			// break;
		}
		response.setContentType("application/json");
		response.getWriter().write(serializer.toJson(result));
		response.getWriter().flush();   

	}
	
	private String initURIAndParams(HttpServletRequest request){
		String uri = request.getRequestURI().toString();
//		System.out.println("Initialy: " + uri);
		try {
//			System.out.println("Before");
//			System.out.println(uri);
			uri = uri.substring(25);
//			System.out.println("After");
//			System.out.println(uri);
			params = request.getParameterMap();
			handler.init(params);
		} catch(Exception e){
			System.out.println("Erreuuuuuuur !!");
			System.out.println("uri = '" + uri + "'");
		}
		return uri;
	}
}
