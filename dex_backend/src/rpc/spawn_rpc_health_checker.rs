use futures::future::join_all;
use reqwest::Client;
use tokio::task;
use tokio::time::{interval, Duration};

pub fn spawn_rpc_health_checker() {
    task::spawn(async {
        let rpcs = get_all_rpcs();
        let client = Client::new();
        let mut ticker = interval(Duration::from_secs(1800)); // 30 minutes

        loop {
            ticker.tick().await;
            println!("[rpc-check] Pinging {} RPC endpoints...", rpcs.len());

            let checks = rpcs.iter().map(|&url| {
                let client = &client;
                async move {
                    let is_ok = client
                        .post(url)
                        .json(&serde_json::json!({
                            "jsonrpc": "2.0",
                            "id": 1,
                            "method": "getHealth"
                        }))
                        .send()
                        .await
                        .map(|resp| resp.status().is_success())
                        .unwrap_or(false);

                    if is_ok {
                        println!("[rpc-check] ✅ {}", url);
                    } else {
                        println!("[rpc-check] ❌ {}", url);
                    }
                }
            });

            join_all(checks).await;
            println!("[rpc-check] ✅ RPC check complete\n");
        }
    });
}

fn get_all_rpcs() -> Vec<&'static str> {
    vec![
        "https://mainnet.helius-rpc.com/?api-key=74d5e993-7ca2-483b-8ce5-ab85b0f3c2c5",
        "https://mainnet.helius-rpc.com/?api-key=9d449d94-3511-4b44-8e58-1f08c1bb47cc",
        "https://mainnet.helius-rpc.com/?api-key=1088c7c6-8bd5-4346-bc92-ae3a7a7de611",
        "https://mainnet.helius-rpc.com/?api-key=9384108d-08b4-4b8a-baac-3bb13c9ff857",
        "https://polished-solemn-season.solana-mainnet.quiknode.pro/64f4cf3bc800a969507e1b4219d2c3b5646fb30e",
        "https://virulent-muddy-wildflower.solana-mainnet.quiknode.pro/1a167db37f3aa4c30e04d21ef7e57818e57116c4",
        "https://quiet-smart-firefly.solana-mainnet.quiknode.pro/6947096f500fd18790146467e1deeaf8dfbf03c3/",
        "https://virulent-muddy-wildflower.solana-mainnet.quiknode.pro/1a167db37f3aa4c30e04d21ef7e57818e57116c4/",
        "https://frequent-fabled-scion.solana-mainnet.quiknode.pro/ce80269d3b3c70b830bdd63ddd71043631a7e9c3/",
        "https://quick-lingering-wildflower.solana-mainnet.quiknode.pro/797a96508162485a64c3c588dcbd6e39495d8f85/",
        "https://small-frosty-valley.solana-mainnet.quiknode.pro/d18d1bcdebfca3d87e43b58c2cec5893e21603ae/",
        "https://nameless-sparkling-friday.solana-mainnet.quiknode.pro/146f75069f1b9a147d76ff8ac78d3f9167e9ad7f/",
        "https://tame-shy-film.solana-mainnet.quiknode.pro/55c1a8027928362ed9f37ee5022dff65a5e5353c/",
        "https://wider-wiser-road.solana-mainnet.quiknode.pro/ac8ba2256c532c19335046bd8c6d6fd5c32de42c/",
        "https://fragrant-side-surf.solana-mainnet.quiknode.pro/20525695656b076184029883ee41eb1ef68033e1/",
        "https://cool-shy-choice.solana-mainnet.quiknode.pro/422f918c663efd137c8486d50da8183fb6d50008/",
        "https://quick-white-dinghy.solana-mainnet.quiknode.pro/8f758885cdb29154daaa16f15e893d18a855143b/",
        "https://frosty-broken-lambo.solana-mainnet.quiknode.pro/66caf48a654aee88491c6936dbbb3467924ea8d8/",
        "https://few-empty-ensemble.solana-mainnet.quiknode.pro/14fa7f68aea4883d87be40c6c2386426b3ebcdaf/",
        "https://palpable-red-tree.solana-mainnet.quiknode.pro/e04d938cc771a38cb5a7917d63b7db3c45c056c1/",
        "https://icy-frequent-log.solana-mainnet.quiknode.pro/1bc7f292484319739e1c06cbb68d0e0c53b38ddd/",
        "https://magical-burned-knowledge.solana-mainnet.quiknode.pro/8af6574e482eef858c7af451bfca917d4d174f09/",
        "https://yolo-flashy-sea.solana-mainnet.quiknode.pro/416f79c4da4040e3d2802fb9911f8a63247db72b/",
        "https://necessary-snowy-dust.solana-mainnet.quiknode.pro/8fd15d84bc68078deab2ae2598e6c632fea31051/",
        "https://skilled-neat-mansion.solana-mainnet.quiknode.pro/3d7db6c8c595f39e23283dbeab22446acfc6af52/",
        "https://bitter-neat-mountain.solana-mainnet.quiknode.pro/4da0c9cf87ce2cb65e868cf8f8de78a40b21c843/",
        "https://radial-special-meadow.solana-mainnet.quiknode.pro/42b6e3370c4fbfbfa070f4e03037ed165c1f3ef1/",
        "https://ancient-winter-mansion.solana-mainnet.quiknode.pro/92d11b5347512c30416781c73b9b6a1f0dd1c6b2/",
        "https://snowy-tiniest-brook.solana-mainnet.quiknode.pro/2d6ce6957f5917d4da74ea1f67fbd91bb1c526db/",
        "https://spring-thrilling-water.solana-mainnet.quiknode.pro/1ec3d480a9b237dc7cfaec298ee4fcc35a2a2abf/",
        "https://morning-responsive-lambo.solana-mainnet.quiknode.pro/e7cbbd75b4dbcce4755fe7215f259a951edc58be/",
        "https://frequent-wispy-aura.solana-mainnet.quiknode.pro/06d8e3ff25bd124f46977756277da5aabcc68f58/",
        "https://young-warmhearted-card.solana-mainnet.quiknode.pro/5014d4fdd205315e4d6a9ce4ba0459f8f0ccf29e/",
        "https://black-intensive-brook.solana-mainnet.quiknode.pro/463195a022d7aacda804860c3c4db1f2f32647d0/",
        "https://greatest-black-dew.solana-mainnet.quiknode.pro/8f33647ae804781123b491f8526b5a6c1141f769/",
        "https://quick-restless-snowflake.solana-mainnet.quiknode.pro/5a9526a53449bb4c420d32721bc4d8fab6b2aed7/",
        "https://lingering-frosty-energy.solana-mainnet.quiknode.pro/927c38af618482c8361a3d12a864909d9d44df03/",
        "https://wispy-broken-borough.solana-mainnet.quiknode.pro/69c82d4daafe928a76822fdb59243dd8359cd961/",
        "https://multi-methodical-bridge.solana-mainnet.quiknode.pro/d65c7da95152b4a690f85d10e994e4afafd65c84/",
        "https://quiet-ancient-flower.solana-mainnet.quiknode.pro/df32ef85b2f04a9741d288e3fd19a58439db746d/",
        "https://purple-autumn-sunset.solana-mainnet.quiknode.pro/d9b9b9d2f510b6c70f2efb75c9b2617502f2df4e/",
        "https://soft-hardworking-arrow.solana-mainnet.quiknode.pro/9b2d534e11d816ce43e947edbdbbc7472c20a766/",
        "https://wiser-misty-meadow.solana-mainnet.quiknode.pro/bac3d9dbfa661db323de9537ef2a03673a143e15/",
        "https://nameless-light-brook.solana-mainnet.quiknode.pro/880f70da8df404f5aec94d6a6978e563ed979124/",
        "https://alpha-snowy-shape.solana-mainnet.quiknode.pro/9964707d86e43fd3b205096fcaca5bcba75fe7b5/",
        "https://serene-magical-aura.solana-mainnet.quiknode.pro/efa4e98414b94425c01060a87158f71f80a03cd3/",
        "https://lively-dawn-county.solana-mainnet.quiknode.pro/8798a09f5930165aa20779c70183e9888896177f/",
        "https://winter-alien-ensemble.solana-mainnet.quiknode.pro/4d9bef447115a42714f1ef4cdc6da55ffc12379b/",
        "https://attentive-empty-model.solana-mainnet.quiknode.pro/719e4244b315420d1faa5416412903224dbf502a/",
        "https://cold-wild-dust.solana-mainnet.quiknode.pro/42d6290a88bf2f1b2132d14a407439d3e76c304d/",
        "https://holy-side-snow.solana-mainnet.quiknode.pro/18c97232b14b5e6c167042e6e0daf6209b77a4dc/",
        "https://aged-broken-wish.solana-mainnet.quiknode.pro/a8a2fb7043215113f7c6a86ddd6e71bd90297ab8/",
        "https://cold-blue-spree.solana-mainnet.quiknode.pro/93e24b04dffd806f114a8633a15e4e2445bafb76/",
        "https://divine-small-waterfall.solana-mainnet.quiknode.pro/200458e0d4bfab536215b59cb936ced208887a91",
        "https://thrumming-necessary-gadget.solana-mainnet.quiknode.pro/ca719e03eab07e1c6a24e06b79a9c8fc699ce529/",
        "https://billowing-red-smoke.solana-mainnet.quiknode.pro/082b91f20a5cefa8437b03b4befec9d3e3df3e42",
        "https://silent-quaint-spree.solana-mainnet.quiknode.pro/953d34b12c216e0d0b12cff1755b94865c2bf417/",
        "https://newest-ultra-scion.solana-mainnet.quiknode.pro/0ee4f37c0de2720b9138d213c86a2954bad2294d/",
        "https://misty-neat-yard.solana-mainnet.quiknode.pro/705ed3fc9fdd3f2f38d3880c4eb360f3fa109102/",
        "https://chaotic-radial-mound.solana-mainnet.quiknode.pro/44edf5a8df5729374c9a52a22e1cdd014b2a97bf/",
        "https://delicate-frequent-log.solana-mainnet.quiknode.pro/c7e7719bc5d0430620a7092bae1dae00354099c2/",
        "https://multi-indulgent-morning.solana-mainnet.quiknode.pro/50808751d9b60e6da5b5080f53e5f574f91dd9b0/",
        "https://restless-dark-putty.solana-mainnet.quiknode.pro/3cc4d8919259d8cee2969932ffa0c0485bd37512/",
        "https://fabled-still-mound.solana-mainnet.quiknode.pro/172a5a52a0606e76c8a0ad13aebde3066cca5473/",
        "https://ultra-nameless-arm.solana-mainnet.quiknode.pro/72f83bb17263123ac32bd3b47591c38373d5f582/",
        "https://quick-wider-layer.solana-mainnet.quiknode.pro/12727b3e191747850bc1b6f58961aac56cfa4c9f/",
        "https://proud-frequent-waterfall.solana-mainnet.quiknode.pro/9662b9af8407e6c49da0caa69f656ec3574e4b34/",
        "https://side-wispy-seed.solana-mainnet.quiknode.pro/b2b356319a82f25106192464c869b482cdee53b6/",
        "https://maximum-wispy-mountain.solana-mainnet.quiknode.pro/c0ea7250ee8790f5588f9ebf11e81784f7762c9a/",
        "https://polished-morning-gadget.solana-mainnet.quiknode.pro/2c1ccfa431be586110f8ec4d16c4065982b67cde/",
        "https://virulent-radial-tree.solana-mainnet.quiknode.pro/f9ebbc86ea02650a17998d39c40c29d0d506a3b8/",
        "https://intensive-quiet-log.solana-mainnet.quiknode.pro/453ca5537bef4236dd4a7b120093572221c9eae7/",
        "https://wandering-polished-patron.solana-mainnet.quiknode.pro/5b9adc6bbefb66e08331ba59464def30694b57be/",
        "https://summer-yolo-borough.solana-mainnet.quiknode.pro/697b2f54abd3ea99879baced237804abb0b4843e/",
        "https://wandering-white-smoke.solana-mainnet.quiknode.pro/e40ded097fcdd5b0ec715426a7dbeabe3eb4b3c6/",
        "https://prettiest-side-frost.solana-mainnet.quiknode.pro/9490721ae0072719c9deff81ece74b014035cb33/",
        "https://fittest-prettiest-asphalt.solana-mainnet.quiknode.pro/c3ae15c0dac5a8eb8916a8bcda2ddcfde3d8dfd9/",
        "https://summer-omniscient-general.solana-mainnet.quiknode.pro/8d8bbbb3b72de9ef44a8bd5980af29fcdb049540/",
        "https://evocative-powerful-sun.solana-mainnet.quiknode.pro/8b75c324232926d296b85754052e90626e90153a/",
        "https://indulgent-dawn-mansion.solana-mainnet.quiknode.pro/2b72e5ec3afe9803c33461d1ba7defa4a245d4cb/",
        "https://old-distinguished-pine.solana-mainnet.quiknode.pro/2eb699c33cc5405b3abb2ddc11c59f57196ed9b0",
        "https://wild-holy-card.solana-mainnet.quiknode.pro/c5bfe7d10ede22a1879d1126358960257ad13223",
        "https://tiniest-blue-pool.solana-mainnet.quiknode.pro/7fa84e0f9ed13fe8b16d27849c0e97074e090ce3/",
        "https://lively-withered-lake.solana-mainnet.quiknode.pro/ff445495fec7d24e530adb5b2e8f63e0c6f78715/",
        "https://purple-old-daylight.solana-mainnet.quiknode.pro/28539d09ddcb409994a5e120453bd9c10705e870/",
        "https://proud-light-isle.solana-mainnet.quiknode.pro/cdf6584a54e32fc4ba66db3249364559f2349ec9/",
        "https://side-newest-sanctuary.solana-mainnet.quiknode.pro/1edf6de7088d11bafe7804c63291000ca6721938/",
        "https://alpha-still-surf.solana-mainnet.quiknode.pro/8bf7e3d83222e498fad5e03711697c2b655316c6/",
        "https://silent-prettiest-crater.solana-mainnet.quiknode.pro/1d7249536a53b800a2b15dcdd4416217afd1814d/",
        "https://omniscient-delicate-feather.solana-mainnet.quiknode.pro/f76bd20684b3385323686e281bcf1ebfe50524a8",
        "https://patient-soft-sky.solana-mainnet.quiknode.pro/2be48857185aaedabafc61e5798c58953c22dd0c/",
        "https://old-capable-haze.solana-mainnet.quiknode.pro/3e53709af387d42f9740976738fa4b0f5ebdaf21/",
        "https://side-clean-water.solana-mainnet.quiknode.pro/f7073dddbf01c54e2b28a132d65b6aab1c35091a/",
        "https://radial-cool-tree.solana-mainnet.quiknode.pro/a65b043c03019f2212cd3c0079288f171f215f79/",
        "https://blue-withered-wave.solana-mainnet.quiknode.pro/0f6d15b5ed5a9fc102d230bbd294ab4bb714dd67/",
        "https://alpha-proud-haze.solana-mainnet.quiknode.pro/791c1a0eaa2c9f91a2bfcbe4a0be507be4d512d0/",
        "https://falling-white-reel.solana-mainnet.quiknode.pro/7f50fb69b9b6600807e4202c4da0e5e3a7953888/",
        "https://quick-chaotic-shard.solana-mainnet.quiknode.pro/a6806f9a6070223553baa67131a330d1149b0e41/",
        "https://warmhearted-tame-tent.solana-mainnet.quiknode.pro/04469fafa4f2f9f9faa994736b8dd1bcd701a5ee/",
        "https://quaint-falling-patina.solana-mainnet.quiknode.pro/4f18ceb3e3bdb26da01a2f04194a3b3ded2a5ab3/",
        "https://morning-cold-hexagon.solana-mainnet.quiknode.pro/f93287a8287ddd7a2896e6d0825c076048b28bcd/",
        "https://wild-fittest-yard.solana-mainnet.quiknode.pro/2e0f054437fbf07e8e02c63a04f2936cab4485af/",
        "https://serene-green-road.solana-mainnet.quiknode.pro/7a5c3bb0749ad306d97620e0f59601c648affb8f/",
        "https://multi-convincing-knowledge.solana-mainnet.quiknode.pro/5e9dfa231fa2b74d1604c0e83bc6de6fff1c5b64/",
        "https://blissful-old-dream.solana-mainnet.quiknode.pro/fb4403dff1d87aefb29e80b46b4f3ff935d72589/",
        "https://bold-black-diagram.solana-mainnet.quiknode.pro/2855a644d3007f094ce29c5d265155d1a1da5d00/",
        "https://holy-prettiest-pond.solana-mainnet.quiknode.pro/5aeec12e96f7775d1fb71c7786624e936b950c8e/",
        "https://fittest-practical-sun.solana-mainnet.quiknode.pro/29233af4a407a2b9a4e96775841d1214e6e6de0d",
        "https://maximum-holy-thunder.solana-mainnet.quiknode.pro/bb33470d7bc54bf02badcc44e23fb4ab7da15f79/",
        "https://fragrant-shy-mound.solana-mainnet.quiknode.pro/83f6a44ba36f6aec55a45e0d90cbaa1e92e0ddb8/",
        "https://dry-frosty-meme.solana-mainnet.quiknode.pro/bbe84c68ae711f0e5484306d514bb33455baad68/",
        "https://still-side-orb.solana-mainnet.quiknode.pro/69492155e48587a7957ac536e5a118fb79f041ba/",
        "https://late-misty-road.solana-mainnet.quiknode.pro/ffa617b8449331afb9a652c95c3a53c7706532a3/",
        "https://stylish-wider-violet.solana-mainnet.quiknode.pro/762e9f4a1a670f55634a893e1f7bfb8caade3a9e/",
        "https://fittest-multi-daylight.solana-mainnet.quiknode.pro/4572a8b3032a634819670429d420d863fd61b676/",
        "https://necessary-side-tree.solana-mainnet.quiknode.pro/2ac08fd1674e0157073e0420d08b0553ea349af6/",
        "https://red-thrumming-owl.solana-mainnet.quiknode.pro/a479852576bf5ea9bdbc50db05bf0546cb008d79/",
        "https://little-red-liquid.solana-mainnet.quiknode.pro/ccfcac8d51ee5e71a284c654fc1144a0b2f29b74/",
        "https://restless-alien-tab.solana-mainnet.quiknode.pro/a315508d02239fa4f122e3dde12cbfbbe48f4427/",
        "https://alpha-side-patina.solana-mainnet.quiknode.pro/09e66c1f54497355bb7f0750ff1da761ae5a1cb0/",
        // "http://va.o7node.com:7799",

        "https://mainnet.helius-rpc.com/?api-key=9c362f85-5ae1-4e35-b6d6-2cab5da74543",
        "https://mainnet.helius-rpc.com/?api-key=435157ed-2a5f-4b75-8b73-a462ddc163c1",
        "https://mainnet.helius-rpc.com/?api-key=f0223380-ccda-44b8-9fd1-38b04668fb7e",
        "https://mainnet.helius-rpc.com/?api-key=a317f4bd-72c5-4c37-911a-2e0994b87f4c",
        "https://mainnet.helius-rpc.com/?api-key=927799c1-95d0-45ba-9ce6-84786255eba8",
        "https://mainnet.helius-rpc.com/?api-key=3a9c151b-406b-470a-8f89-1747226e27d9"
    ]
}
