package org.acme.quarkus.sample;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.ProcessingException;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path("/")
public class HelloResource {

    private static final String RESPONSE_STRING_FORMAT = "Hello => %s\n";

    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Inject
    @RestClient
    OlaService olaService;

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public Response hello() {
        try {
            String response = olaService.getOla();
            String msg = String.format(RESPONSE_STRING_FORMAT, response);
            logger.info(msg);
            return Response.ok(msg).build();
        } catch (WebApplicationException ex) {
            Response response = ex.getResponse();
            logger.warn("Non HTTP 20x trying to get the response from recommendation service: " + response.getStatus());
            ex.printStackTrace();
            return Response
                    .status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity(String.format(RESPONSE_STRING_FORMAT,
                            String.format("Error: %d - %s", response.getStatus(), response.readEntity(String.class)))
                    )
                    .build();
        } catch (ProcessingException ex) {
            logger.warn("Exception trying to get the response from recommendation service.", ex);
            return Response
                    .status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity(String.format(RESPONSE_STRING_FORMAT, ex.getCause().getClass().getSimpleName() + ": " + ex.getCause().getMessage()))
                    .build();
        }
    }
}