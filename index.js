const express = require("express");
const app = express();
const port = 3000;

const firebase = require("firebase");

const config = require("./config");
firebase.initializeApp(config);

const initialNodes = require("./initial_nodes");

const database = firebase.database();
const nodesRef = database.ref("nodes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`NodeInfo app listening on port ${port}!`));

app.get("/init", (req, res) => {
  nodesRef.set(initialNodes);
  res.send(initialNodes);
});

app.post("/take", async (req, res) => {
  console.log(req.query);
  nodeId = req.query.text;
  name = req.query.user_name;

  await nodesRef
    .child(parseInt(nodeId))
    .child("users")
    .update({
      [name]: ""
    });

  res.send(`node${nodeId} was taken by ${name}`);
});

// available: 현재 사용하지 않는 노드 리스트 반환
// check node##: node ##를 사용하고 있는 사용자 반환 (없으면 not occupied)
// take node## {user}: node ##를 자신이 사용하도록 설정
// release node## {user}: node ##를 더이상 자신이 사용안하는 것으로 설정

// alive: 현재 사용 '가능한' 노드 리스트 반환
// status node##: node ##의 cpu. gpu 사용량 반환
// top -b -n1 | grep -Po '[0-9.]+ id' | awk '{print 100-$1}'

// f1: firebase database 연결
// f2: 각 node에 직접 ssh 접속해서 bash command 날리기
