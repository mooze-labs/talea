mod harness;

use talea_client::cli::{AccountCmd, AssetCmd, Cli, Command, execute};

fn cli(url: &str, command: Command) -> Cli {
    Cli {
        url: url.to_string(),
        token: None,
        timeout_secs: 30,
        command,
    }
}

#[tokio::test]
async fn cli_round_trip_against_real_server() {
    let url = harness::spawn_server(None).await;

    // register + open are unit ops -> None
    let out = execute(cli(&url, Command::Asset {
        cmd: AssetCmd::Register {
            id: "USD".into(),
            class: "fiat".into(),
            network: None,
            native_id: None,
            precision: 2,
            name: "US Dollar".into(),
        },
    }))
    .await
    .unwrap();
    assert!(out.is_none());

    for (path, kind, side) in [("cash", "asset", "debit"), ("deposits", "liability", "credit")] {
        execute(cli(&url, Command::Account {
            cmd: AccountCmd::Open {
                book: "b".into(),
                path: path.into(),
                asset: "USD".into(),
                kind: kind.into(),
                normal_side: Some(side.into()),
                min_balance: None,
            },
        }))
        .await
        .unwrap();
    }

    // post via flag syntax
    let posted = execute(cli(&url, Command::Post {
        book: Some("b".into()),
        idem: Some("k1".into()),
        debit: vec!["cash:USD:1000".into()],
        credit: vec!["deposits:USD:1000".into()],
        occurred_at: None,
        metadata: None,
        draft: None,
    }))
    .await
    .unwrap()
    .expect("post returns a value");
    assert_eq!(posted["seq"], 3);

    // balance view
    let bal = execute(cli(&url, Command::Balance {
        book: "b".into(),
        path: "cash".into(),
        as_of: None,
    }))
    .await
    .unwrap()
    .expect("balance returns a value");
    assert_eq!(bal["balance"], "10.00");
}
