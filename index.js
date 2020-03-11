const express = require("express");
const app = express();
const host = "0.0.0.0";
const port = process.env.PORT || 3000;

const firebase = require("firebase");

const config = require("./config");
firebase.initializeApp(config);

const database = firebase.database();
const nodesRef = database.ref("nodes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, host, () =>
  console.log(`NodeInfo app listening on port ${port}!`)
);

app.post("/check", (req, res) => {
  [nodeId] = req.body.text.trim();
  nodesRef
    .child(parseInt(nodeId))
    .child("users")
    .once("value")
    .then(snapshot => {
      if (snapshot.val() == null) {
        res.send(`node${nodeId} is free!`);
        return;
      }
      users = Object.keys(snapshot.val());
      res.send(`node${nodeId} is taken by ${users.join(", ")}`);
    });
});

app.post("/take", async (req, res) => {
  [nodeId, name] = req.body.text.trim().split(" ");

  await nodesRef
    .child(parseInt(nodeId))
    .child("users")
    .update({
      [name]: name
    });

  res.send(`node${nodeId} is now taken by ${name}`);
});

app.post("/release", async (req, res) => {
  [nodeId, name] = req.body.text.trim().split(" ");

  await nodesRef
    .child(parseInt(nodeId))
    .child("users")
    .child(name)
    .remove();

  res.send(`node${nodeId} is now released from ${name}`);
});

app.post("/findfreenodes", (req, res) => {
  nodesRef.once("value").then(snapshot => {
    nodes = snapshot.val();
    freeNodes = [];

    for (var id in nodes) {
      console.log(nodes[id].users);
      if (
        nodes[id].users == undefined ||
        Object.keys(nodes[id].users).length == 0
      ) {
        freeNodes.push("node" + id);
      }
    }

    if (freeNodes.length == 0) {
      res.send("Unfortunately, no nodes are available.");
    } else {
      res.send(
        `Currently, ${freeNodes.join(", ")} are free. Take one of them!`
      );
    }
  });
});

// release node## {user}: node ##를 더이상 자신이 사용안하는 것으로 설정

// alive: 현재 사용 '가능한' 노드 리스트 반환
// status node##: node ##의 cpu. gpu 사용량 반환
// top -b -n1 | grep -Po '[0-9.]+ id' | awk '{print 100-$1}'

// f1: firebase database 연결
// f2: 각 node에 직접 ssh 접속해서 bash command 날리기
