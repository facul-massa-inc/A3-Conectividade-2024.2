<script lang="ts">
    import { onMount } from "svelte";
    let value: string;
    let socket: WebSocket = <any>undefined;

    let messages: string[] = [];

    onMount(() => {
        socket = new WebSocket("ws://localhost:3000");

        socket.addEventListener("message", (ev) => {
            let msg: string = ev.data;
            messages.push(msg);
            messages = messages;
        });
    });

    function send() {
        socket.send(value);
    }
</script>
<input type="text" bind:value={value}>
<button on:click={send}>Enviar</button>
{#each messages as message}
     <p>{message}</p>
{/each}

