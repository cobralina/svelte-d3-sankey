<script>
  import { onMount } from "svelte";
 
  const { metaObject } = $props();
  let headerContent = $state({})
  

  onMount(async () => {
    try {
      headerContent = metaObject
    } catch (error) {
      console.error("Error loading header-data:", error);
    }
  });
</script>

<div class="header">
  {#if headerContent}
  <div class="hl_box">
      <div class="kicker">{ headerContent.kicker }</div>
    <div class="wwHeadline">{ headerContent.headline }</div>
    <div class="wwSubline">{ headerContent.subline }</div>
</div>
<!-- <div class="column_box">
  <div class="column">
    { headerContent.past }
  </div>
  <div class="column">
    { headerContent.current }
  </div>
</div> -->
{/if}
</div>

<style>

</style>
