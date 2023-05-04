import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  ConnectionMode,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  ReactFlowProvider,
  useReactFlow,
  useNodes,
  useEdges,
  Controls
} from "reactflow";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";

import "reactflow/dist/style.css";

import TextUpdaterNode from "./TextUpdaterNode.js";
import DownloadButton from "./DownloadButton";
import SimpleFloatingEdge from "./SimpleFloatingEdge.js";

import "./text-updater-node.css";

const rfStyle = {
  backgroundColor: "#12465f"
};

//have to set the IDs of the HTML elements INSIDE of each node
let nodeid = 0;
var ids = ["toplevel" + nodeid, "nodelbl" + nodeid, "lbl" + nodeid];
const updateIDs = () => {
  nodeid++;
  ids = ["toplevel" + nodeid, "nodelbl" + nodeid, "lbl" + nodeid];
};

let numnodes = 0;
let xcoords = [143, 155, 145, 24, -76, -135, -89, 21];
let ycoords = [-76, 13, 115, 132, 109, 3, -90, -107];

var edge_list = [];

//helper functions to give each node an ID # and position

let id = 1;
const getId = () => `${id++}`;

const getxpos = () => {
  let indx = numnodes % 8;
  return xcoords[indx];
};

const getypos = () => {
  let indx = numnodes % 8;
  return ycoords[indx];
};

// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = { textUpdater: TextUpdaterNode };
const edgeTypes = { floating: SimpleFloatingEdge };

function Flow() {
  const { getNodes, getNode, getEdges } = useReactFlow();
  const [thisState, setState] = useState();

  //starting to connect the edges, need to get the ID of the node
  const createEdge = (oldid, newid) => {
    const newedge = {
      id: "e" + oldid + "-" + newid,
      source: oldid,
      target: newid,
      sourceHandle: "a",
      targetHandle: "b",
      type: "floating",
      markerEnd: {
        type: MarkerType.ArrowClosed
      }
    };
    edge_list.push(newedge); //need to read what the edges are in TextUpdaterNode
    return newedge;
  };

  const createNode = (old) => {
    updateIDs(); //next node that is created gets new HTML id names
    const eyed = getId();
    const xposition = Number(getxpos());
    const yposition = Number(getypos());

    var text_label = "";
    let newnode;
    if (old === "0") {
      //add to the number of child nodes
      numnodes += 1;
      text_label = "New Subject";
      newnode = {
        id: eyed,
        type: "textUpdater",
        position: { x: xposition, y: yposition },
        data: { label: text_label, value: [combineNodeEdge, ids, edge_list] }
      };
    } else {
      text_label = "New Task";
      newnode = {
        id: eyed,
        type: "textUpdater",
        position: { x: xposition, y: yposition },
        data: { label: text_label, value: [combineNodeEdge, ids, edge_list] },
        parentNode: `${old}`
      };
    }

    return newnode;
  };

  const combineNodeEdge = (oldid) => {
    var thisnode = createNode(oldid);
    const alledges = getEdges();

    let connected = alledges.filter((x) => x.id.includes("e0-"));

    //this is to ensure only 8 child nodes are made
    if (connected.length >= 8 && oldid === "0") {
      alert("Sorry, a maximum of 8 child nodes can be created.");
      return;
    } else if (oldid !== "0") {
      //if this is a subnode
      let old_element = getNode(oldid);
      let edge_id = `e${old_element.id}-`;
      let num_connected = alledges.filter((x) => x.id.includes(edge_id));

      if (old_element.position.x > 0) {
        //place task node to the right
        thisnode.position.x = 100;
        thisnode.position.y = -50 + num_connected.length * 65;
      } else {
        //place task node to the left
        thisnode.position.x = -100;
        thisnode.position.y = -50 + num_connected.length * 65;
      }
    }

    var thisedge = createEdge(oldid, thisnode.id);

    setNodes((nds) => nds.concat(thisnode));
    setEdges((eds) =>
      eds.concat({
        id: thisedge.id,
        source: thisedge.source,
        target: thisedge.target,
        sourceHandle: thisedge.sourceHandle,
        targetHandle: thisedge.targetHandle,
        markerEnd: thisedge.markerEnd,
        type: thisedge.type
      })
    );

    setTimeout(() => {
      setNodes((nds) =>
        nds.map((node) => {
          return node;
        })
      );

      setEdges((eds) =>
        eds.map((edge) => {
          return edge;
        })
      );
    }, 1);
  };

  const initialNodes = [
    {
      id: "0",
      type: "textUpdater",
      position: { x: 0, y: 0 },
      data: { label: "Brain Map", value: [combineNodeEdge, ids, edge_list] },
      deletable: false
    }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const deleteNodeById = (id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
  };

  const onNodesDelete = useCallback(
    (deleted) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);

          for (var i = 0; i < outgoers.length; i++) {
            deleteNodeById(outgoers[i].id);
          }

          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge)
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `e${source}->${target}`,
              source,
              target
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );
    },
    [nodes, edges]
  );

  return (
    <div className="wrapper">
      <DownloadButton />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesDelete={onNodesDelete}
        fitView
        style={rfStyle}
        connectionMode={ConnectionMode.Loose}
      >
        <Controls />
      </ReactFlow>
      <div className="tool btn btn-primary tooltip">
        <FontAwesomeIcon icon={faCircleQuestion} className="qmark" />
        <div class="top">
          <h3>Welcome to Brain Map!</h3>
          <p>
            Hi, I'm Iyanna Buffaloe and this is a webpage that I designed using
            react and reactflow to visually map data.
          </p>
          <h3>How it Works</h3>
          <p>
            Hover on the main "Brain Map" node and click the plus button to add
            more ideas to your graph.
            <p>
              {" "}
              Pressing any node (except the main circle) and hitting "backspace"
              will delete it.{" "}
            </p>
          </p>
          <p>
            Clicking plus on these nodes will create sub-nodes, or "sub-tasks".
          </p>
          <p>Double click on the title of any node to change the name.</p>
          <p>Click and drag any node to move it around. Happy Mapping! </p>
        </div>
      </div>
    </div>
  );
}

function FlowWithProvider() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

export default FlowWithProvider;
