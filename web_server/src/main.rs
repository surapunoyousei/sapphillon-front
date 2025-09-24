use actix_web::{App, HttpServer, middleware::Logger};
use actix_web_static_files::ResourceFiles;
use std::env;
use log::{error, info};

include!(concat!(env!("OUT_DIR"), "/generated.rs"));

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger from RUST_LOG env var (e.g. RUST_LOG=info or actix_web=info)
    env_logger::init();

    let listen = env::var("LISTEN").unwrap_or_else(|_| "127.0.0.1:8081".into());

    // Attempt to bind the server and log any bind errors
    let server = match HttpServer::new(|| {
        let generated = generate();
        App::new()
            .wrap(Logger::default())
            .service(ResourceFiles::new("/", generated))
    })
    .bind(&listen)
    {
        Ok(s) => s,
        Err(e) => {
            error!("Failed to bind to {}: {}", listen, e);
            return Err(e);
        }
    };

    if let Some(addr) = server.addrs().first() {
        info!("listening on {}", addr);
        println!("{:05}", addr.port());
    }

    // Run server and log any runtime errors
    let handle = actix_web::rt::spawn(async move {
        if let Err(e) = server.run().await {
            error!("Server error: {}", e);
        }
    });

    handle.await?;
    Ok(())
}