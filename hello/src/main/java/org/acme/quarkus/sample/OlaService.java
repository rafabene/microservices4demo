package org.acme.quarkus.sample;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.eclipse.microprofile.rest.client.annotation.RegisterClientHeaders;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * OlaService
 */
@RegisterRestClient
@RegisterClientHeaders
public interface OlaService {

    @Path("/")
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String getOla();
}