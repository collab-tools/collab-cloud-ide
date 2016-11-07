<template>
<div id='container'>
  <div class="row">
    <panel-component></panel-component>
  </div>
  <div class="row">
    <div class="col-md-3">
      <explorer-component></explorer-component>
    </div>
    <div class="col-md-9">
      <editor-component></editor-component>
    </div>
  </div>
</div>
</template>

<script>
  import EditorView from './editor.vue';
  import ExplorerView from './explorer.vue';

  export default {
    name: 'AppView',
    data: () => ({
      userToken: null,
      explorerTree: [],
      content: null,
    }),
    components: {
      EditorView,
      ExplorerView,
    },
  };
</script>