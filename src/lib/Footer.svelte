<script>
  import { onMount } from "svelte";
 
  const { sourceText, authorText } = $props();
  let sourceContent = $state({});
  let authorContent = $state({});
  

  onMount(async () => {
    try {
      sourceContent = sourceText
      authorContent = authorText
    } catch (error) {
      console.error("Error loading header-data:", error);
    }
  });
</script>

<div class="footer">
  {#if authorContent}
  Grafik: { authorContent } /
{/if}
  {#if sourceContent}
  Quelle: { sourceContent }
{/if}
</div>

<style>

</style>
