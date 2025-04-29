use crate::server::create_server::create_server;
//
pub async fn start_server(){
    warp::serve(create_server())
        .run(([0, 0, 0, 0], 7778))
        .await;


    

}