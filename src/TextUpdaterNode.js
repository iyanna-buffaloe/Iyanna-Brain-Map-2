import { React, useState, useCallback } from "react";
import { Handle, Position } from "reactflow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus, faCircleXmark } from "@fortawesome/free-solid-svg-icons";

const handleStyle = { left: 0 };
var style = "100px";
var class_list = ["color3", "color4", "color5"];

function TextUpdaterNode({ data, isConnectable }) {
  //grab all elements
  var elements = document.getElementsByClassName("text-updater-node");

  var numchild = 1;
  // loop through all elements and change size/color
  for (let i = 0; i < elements.length; i++) {
    var thiselement = document.getElementById(elements[i].id);

    if (thiselement.id !== "toplevel0") {
      //find where this node is coming from
      var findthis = "-" + thiselement.id.replace("toplevel", "");
      var edge_array = data.value[2];
      //grab that edge that describes if its connected to 0 or not
      var this_edge = edge_array.find((e) => e.id.includes(findthis));

      //if it's attached to 0, its a slightly smaller node
      //if attached to anything else, that means its a super small one
      if (this_edge.id.includes("e0-")) {
        thiselement.classList.remove("parentbutton");
        //i had to go DEEP to get the label element to
        //change classes according to the size of the node

        let nlabel = thiselement.children;
        let nlabel2 = nlabel[1].children;

        let labelelement = nlabel2[0].children;
        let element_class = labelelement[0].className.split(" ");

        if (!element_class.includes("formclass")) {
          labelelement[0].classList.remove("nodelabel");
          var list = [...thiselement.classList].toString();
          if (!list.includes("color")) {
            thiselement.classList.add(class_list[numchild % 3]);
          }
          numchild += 1;
          thiselement.classList.add("childbutton");

          labelelement[0].classList.add("childnodelabel");
        }
      } else {
        let split_array = this_edge.id.split("-");
        /*
          this var numbers is the parent node we're attached to 
        */
        let numbers = split_array[0].match(/\d+/g);
        let old_node = document.getElementById(`toplevel${numbers}`);
        var oldclass_list = [...old_node.classList];

        var old_style = oldclass_list.find((e) => e.includes("color"));

        let nlabel = thiselement.children;
        let nlabel2 = nlabel[1].children;

        let labelelement = nlabel2[0].children;
        let element_class = labelelement[0].className.split(" ");
        thiselement.classList.add(old_style);
        if (!element_class.includes("formclass")) {
          thiselement.classList.remove("parentbutton");
          labelelement[0].classList.remove("nodelabel");

          thiselement.classList.add("subchildbutton");

          labelelement[0].classList.add("subchildnodelabel");
        }
      }
    }
  }
  const [thisstate, updateState] = useState(style);

  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);

  const doubleclique = (element, idarr) => {
    element.addEventListener("dblclick", function (event) {
      handleTitle(idarr);
    });
  };

  const handleTitle = (idarray) => {
    var lbldiv = document.getElementById(idarray[1]);
    var labelhtml = document.getElementById(idarray[2]);
    lbldiv.removeChild(labelhtml);

    var newlblform = document.createElement("form");
    newlblform.setAttribute("class", "formclass");
    var lblinput = document.createElement("input");

    lblinput.setAttribute("type", "text");
    lblinput.setAttribute("class", "inputlabel");
    lblinput.setAttribute("placeholder", "Enter a new name...");
    lblinput.setAttribute("maxlength", "40");
    lblinput.setAttribute("value", labelhtml.innerHTML);

    lblinput.innerHTML = <FontAwesomeIcon icon={faCircleXmark} />;

    console.log(lblinput.innterHTML);
    newlblform.appendChild(lblinput);
    newlblform.setAttribute("id", idarray[2]);

    var newnodelbl = document.createElement("label");
    doubleclique(newnodelbl, idarray);
    newnodelbl.setAttribute("id", idarray[2]);
    newnodelbl.setAttribute("class", "nodelabel");
    newlblform.addEventListener("submit", function (event) {
      newnodelbl.innerHTML = lblinput.value;
      lbldiv.removeChild(newlblform);
      lbldiv.appendChild(newnodelbl);

      var numlines = lblinput.value.length * 2.5;
      style = numlines + "px";
      updateState(style);
      event.preventDefault();
    });

    lbldiv.appendChild(newlblform);
  };

  const handlePress = (idarray) => {
    var oldidarry = idarray[0].match(/(\d+)/);
    var oldid = oldidarry[0];

    data.value[0](oldid); //createEdge
  };

  return (
    <div id={data.value[1][0]} className="text-updater-node parentbutton">
      <Handle
        id="a"
        className="handle"
        type="source"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div>
        <div id={data.value[1][1]}>
          <label
            id={data.value[1][2]}
            onDoubleClick={() => handleTitle(data.value[1])}
            className="nodelabel"
          >
            {data.label}
          </label>
        </div>
        <button
          className="buttonclass plusclass"
          style={{ backgroundColor: "transparent", borderColor: "transparent" }}
        >
          <FontAwesomeIcon
            icon={faSquarePlus}
            onClick={() => handlePress(data.value[1])}
          />
        </button>
      </div>
      <Handle
        id="b"
        className="handle"
        type="source"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        id="c"
        className="handle"
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
      <Handle
        id="d"
        className="handle"
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default TextUpdaterNode;
