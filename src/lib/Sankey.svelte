<script>
  import { sankey, sankeyLinkHorizontal } from "d3-sankey";
  import { onMount } from "svelte";

  const { dataObject, configObject, metaObject } = $props();
  

  // Data and dimensions
  let data = $state({ nodes: [], links: [] });
  let config = $state({ direction: "", party: "" });

  let width = $state(800);
  let height = $derived(width < 620 ? 350 : 600);
  const margin = { top: 20, right: 0, bottom: 20, left: 0 };
  const padding =15;

  //width of node-rects calculated from length of node-text:
  let longestNameLength = $state(0);
  let blockwidth = $derived(width < 620 ? longestNameLength*7 + 20 : longestNameLength*10 + 50);

  // Sankey generator
  let sankeyGenerator = $derived(
    sankey()
      .nodeWidth(blockwidth)
      .nodePadding(padding)
      .nodeSort(null)
      .size([width, height])
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
  );

  // Process data through sankey generator
  let sankeyData = $derived(
    data.nodes.length === 0
      ? null
      : sankeyGenerator({
          nodes: data.nodes.map((d) => ({ ...d })),
          links: data.links.map((d) => ({ ...d })),
        })
  );

  // Look for presetted party and target and mark it
  function configNodes() {
    if (config.party !== "") {
      let allLinks = document.getElementsByClassName("link");
      Array.from(allLinks).forEach((element) => {
        element.setAttribute("stroke-opacity", 0.1);
      });
      let selector = `[id^="${config.party}"][id*="-"]`;
    if (config.direction === "target") {
      // if target-node
      selector = `[id*="-${config.party}"]`;
    }
    let selectedValues;
    if (config.direction === "source") {
      // if source-node
      selectedValues = `[id^="right_val_"][id*="${config.party}-"]`;
    }
    if (config.direction === "target") {
      // if target-node
      selectedValues = `[id^="left_val_"][id*="-${config.party}"]`;
    }
    const hoverItems = document.querySelectorAll(selector);
    const hoverValues = document.querySelectorAll(selectedValues);
    const linkElements = document.querySelectorAll('.link');
    let valElements = document.querySelectorAll('.left-values');
    if (config.direction === "target") { 
      valElements = document.querySelectorAll('.right-values');
    }
    hoverItems.forEach((element) => {
      element.setAttribute("stroke-opacity", 1);
      linkElements.forEach((link) => { //get selected path links up
      if (link.parentNode === element.parentNode) { 
        link.parentNode.appendChild(element); 
        }
      });
    });
    hoverValues.forEach((element) => {
      console.log(element.id)
      element.setAttribute("opacity", 1);
      element.setAttribute("stroke-opacity", 1);
      valElements.forEach((val) => { //get selected values up
      if (val.parentNode === element.parentNode) { 
        val.parentNode.appendChild(element); 
        }
      });
    });
    }    
  }


  // Hovering Links and node Boxes:
  function handleMarkNodes(node, x0) {
    let allLinks = document.getElementsByClassName("link"); // clear links first
    Array.from(allLinks).forEach((element) => {
      element.setAttribute("stroke-opacity", 0.2);
    });
    let allValues = document.querySelectorAll(".left-values, .right-values");  //clear values first
    Array.from(allValues).forEach((element) => {
      element.setAttribute("stroke-opacity", 0);
      element.setAttribute("opacity", 0);
    });

    let selector = `[id^="${node}"][id*="-"]`;  // nodes or links for hovered item
    if (x0 > width / 2) {
      // if target-node
      selector = `[id*="-${node}"]`;
    }
    let selectedValues = `[id^="right_val_${node}"]`;  // values for hovered item
    if (x0 > width / 2) {
      // if target-node
      selectedValues = `[id^="left_val_"][id*="-${node}"]`;
    }
    const hoverItems = document.querySelectorAll(selector);
    const hoverValues = document.querySelectorAll(selectedValues);
    const linkElements = document.querySelectorAll('.link');
    let valElements = document.querySelectorAll('.left-values');
    if (x0 > width / 2) { 
      valElements = document.querySelectorAll('.right-values');
    }

    hoverItems.forEach((element) => {
      element.setAttribute("stroke-opacity", 1);
      linkElements.forEach((link) => { //get selected path links up
      if (link.parentNode === element.parentNode) { 
        link.parentNode.appendChild(element); 
        }
      });
    });

    hoverValues.forEach((element) => {
      element.setAttribute("opacity", 1);
      element.setAttribute("stroke-opacity", 1);
      valElements.forEach((val) => { //get selected values up
      if (val.parentNode === element.parentNode) { 
        val.parentNode.appendChild(element); 
        }
      });
    });
  }

  // clear hovering and look for presetted party and target
  function handleClearNodes(node, x0) {
    let allLinks = document.getElementsByClassName("link");
    Array.from(allLinks).forEach((element) => {
      element.setAttribute("stroke-opacity", 0.4);
    });

    let selector = `[id^="${node}"][id*="-"]`;
    if (x0 > width / 2) {
      // if target-node
      selector = `[id*="-${node}"]`;
    }
    let selectedValues = `[id^="right_val_${node}"]`;
    if (x0 > width / 2) {
      // if target-node
      selectedValues = `[id^="left_val_"][id*="-${node}"]`;
    }
    const hoverItems = document.querySelectorAll(selector);
    const hoverValues = document.querySelectorAll(selectedValues);

    hoverItems.forEach((element) => {
      element.setAttribute("stroke-opacity", 0.4);
    });
    hoverValues.forEach((element) => {
      element.setAttribute("opacity", 0);
      element.setAttribute("stroke-opacity", 0);
    });

    configNodes();
  }

  // get Sankey Path with fix for horizontal pathes:
  function getSankeyPath(d) {
    const path = sankeyLinkHorizontal()(d);
    const match = path.match(/,([^C]+)C/);

    if (match && match.length === 2) {
      const replacementValue = +match[1] + 0.01;
      return path.replace(match[1], "" + replacementValue);
    }

    return path;
  }


  onMount(async () => {
    try {
      data = dataObject;
      
      // extract not used nodes, for padding-bugfix!
      const usedIndices = new Set();
      data.links.forEach(link => {
          usedIndices.add(link.source);
          usedIndices.add(link.target);
      });
      const oldToNewIndex = {};
      let newIndex = 0;
      data.nodes = data.nodes.filter((node, index) => {
          if (usedIndices.has(index)) {
              oldToNewIndex[index] = newIndex; 
              newIndex++;
              return true; 
          }
          return false; 
      });

      data.links = data.links.map(link => {
          const newSource = oldToNewIndex[link.source];
          const newTarget = oldToNewIndex[link.target];

          if (newSource !== undefined && newTarget !== undefined) {
              return {
                  source: newSource,
                  target: newTarget,
                  value: link.value
              };
          }
      }).filter(link => link !== undefined); // Remove any undefined links
      
      config = configObject;
      longestNameLength = data.nodes.reduce((maxLength, node) => {
    return Math.max(maxLength, node.name.length);
  }, 0);
    } catch (error) {
      console.error("Error loading Data:", error);
    }
  });
</script>

<div bind:clientWidth={width}>
  <div class="column_box">
    <div class="column" style="margin-left:{ blockwidth /2 -21 }px">
      { metaObject.past }
    </div>
    <div class="column" style="margin-right:{ blockwidth /2 -21 }px">
      { metaObject.current }
    </div>
  </div>
  {#if sankeyData}
    {console.log(sankeyData)}
    <svg {width} {height}>
      <defs>
        {#each sankeyData.links as link}
          <linearGradient
            id={`gradient-${link.source.name}-${link.target.name}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stop-color={sankeyData.nodes[link.source.index].color}
            />
            <stop
              offset="100%"
              stop-color={sankeyData.nodes[link.target.index].color}
            />
          </linearGradient>
        {/each}
      </defs>

      {#each sankeyData.links as link}
        <!-- stroke={"url(#gradient-"+link.source.name+"-"+link.target.name}  -->
        <path
          role="button"
          aria-label="node-button"
          d={getSankeyPath(link)}
          fill="none"
          stroke={"url(#gradient-" + link.source.name + "-" + link.target.name}
          stroke-opacity="0.4"
          stroke-width={Math.max(1, link.width)}
          class="link"
          id={link.source.name + "-" + link.target.name}
          onmouseover={() => handleMarkNodes(link.source.name, 0)}
          onfocus={() => handleMarkNodes(link.source.name, 0)}
          onblur={() => handleMarkNodes(link.source.name, 0)}
          onmouseout={() => handleClearNodes(link.source.name, 0)}
          onclick={() => handleMarkNodes(link.source.name, 0)}
        />
      {/each}

      <!-- Nodes -->
      {#each sankeyData.nodes as node}
        {#if node.y1 - node.y0 !== 0}
         <g
            class="node"
            transform="translate({node.x0},{node.y0})"
            role="button"
            aria-label="node-button"
            tabindex="0"
            onmouseover={() => {
                handleMarkNodes(node.name, node.x0);
            }}
            onfocus={() => {
              handleMarkNodes(node.name, node.x0);
          }}
            onblur={() => {
              handleMarkNodes(node.name, node.x0);
          }}
            onclick={() => {
            handleMarkNodes(node.name, node.x0);
            }}
            onmouseout={() => {
            handleClearNodes(node.name, node.x0);
            }}
          >
            <rect
              height={node.y1 - node.y0}
              width={node.x1 - node.x0}
              fill={node.color}
              class="node-rect">
            </rect>
         
            <!-- outline for party-names: -->
            <text
              x={blockwidth/2}
              y={(node.y1 - node.y0) / 2}
              dy="0.35em"
              stroke={node.color}
              text-anchor="middle"
              class="text-partys"
            >
              {node.name}
            </text>
            <!-- filling for party-names: -->
            <!-- text-anchor={node.x0 < width / 2 ? "start" : "end"}-->
            <!--  x={node.x0 < width / 2 ? 10 : blockwidth - 10}-->
            <text
              x={blockwidth/2}
              y={(node.y1 - node.y0) / 2}
              dy="0.35em"
              text-anchor="middle"
              class="text-partys"
            >
              {node.name}
            </text>
          </g>
        {/if}
      {/each}

      <!-- link values -- left side  -->
      {#each sankeyData.links as link}
        <g
          id={"left_val_" + link.source.name + "-" + link.target.name}
          class="left-values"
          opacity="0"
        >
          <!-- outlines -->
          <text
            dy="0.35em"
            x={link.source.x1 + 5}
            y={link.y0}
            stroke={sankeyData.nodes[link.source.index].color}
            text-anchor={"start"}
            class="text-values"
          >
            {link.value.toLocaleString()}
          </text>
          <!-- white-text -->
          <text
            dy="0.35em"
            x={link.source.x1 + 5}
            y={link.y0}
            fill="#ffffff"
            text-anchor={"start"}
            class="text-values"
          >
            {link.value.toLocaleString()}
          </text>
        </g>
        <!-- link values -- right side  -->
        <g
          id={"right_val_" + link.source.name + "-" + link.target.name}
          opacity="0"
          class="right-values"
        >
          <!-- outlines -->
          <text
            dy="0.35em"
            x={link.target.x0 - 5}
            y={link.y1}
            stroke={sankeyData.nodes[link.target.index].color}
            text-anchor={"end"}
            class="text-values"
          >
            {link.value.toLocaleString()}
          </text>
          <!-- white-text -->
          <text
            dy="0.35em"
            x={link.target.x0 - 5}
            y={link.y1}
            fill="#ffffff"
            text-anchor={"end"}
            class="text-values"
          >
            {link.value.toLocaleString()}
          </text>
        </g>
      {/each}
    </svg>
  {/if}
  {configNodes()}
</div>

<style>

</style>
