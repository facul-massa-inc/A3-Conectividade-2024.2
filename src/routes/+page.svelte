<script lang="ts">
    import { onMount } from "svelte";
    import type { MessageData } from "../lib/lib";
    import { browser } from "$app/environment";

    let value: string;
    let username: string;
    let socket: WebSocket = <any>undefined;
    let bytesRecv = 0;
    let bytesSent = 0;
    let chat: HTMLDivElement;
    let mobNameContainer: HTMLDivElement;
    let mobName: HTMLInputElement;
    let mediaBar: HTMLDivElement;
    let mediaImageInput: HTMLInputElement;
    let messages: MessageData[] = [];
    let innerWidth: number;
    
    onMount(() => {
        socket = new WebSocket("ws://192.99.78.17:1000");

        socket.addEventListener("message", (ev) => {
            let msg: MessageData;
            try { msg = JSON.parse(ev.data); } catch(e) { return; };
            bytesRecv += (<string>ev.data).length;
            msg.username = msg.username ? msg.username : "Anônimo";
            messages.push(msg);
            messages = messages;
        });

        window.addEventListener("click", (ev) => {
            if(!mediaBar.contains(<Node>ev.target) && !(ev.target instanceof HTMLButtonElement)) {
                showMedia(false);
            }
        });
        new MutationObserver(() => chat.scrollTop = chat.scrollHeight).observe(chat, {childList: true});
    }); 

    function send() {
        sendMessage(<MessageData>{message: value, username: username});
    }

    function sendMessage(data: MessageData) {
        let msg = JSON.stringify(data);
        bytesSent += msg.length;
        socket.send(msg);
        value = "";
    }
    
    function isValidToSend(val: string): boolean {
        return !!val;
    }

    function inputKey(ev: KeyboardEvent) {
        if(ev.key === "Enter" && isValidToSend(value)) {
            send();
        }    
    }

    function mobNameInputKey(ev: KeyboardEvent) {
        if(ev.key === "Enter") {
            showMobNameContainer(false);
        }  
    }

    function showMobNameContainer(show: boolean) {
        if(show) {
            mobNameContainer.style.visibility = "visible"
            mobNameContainer.style.opacity = "1";
            mobName.focus();
        }else {
            mobNameContainer.style.visibility = "hidden"
            mobNameContainer.style.opacity = "0";
        }
    }

    function showMedia(show: boolean) {
        mediaBar.style.transform = show ? "none" : "translateY(100%)";
    }

    let imageFiles: FileList;
    $: imageUpload(imageFiles);
    function imageUpload(files: FileList) {
        if(!browser || !files) return;
        showMedia(false);
        if(!files[0].type.startsWith("image/")) {
            alert("Arquivo precisa ser uma imagem.");
            return;
        }
        
        let reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onerror = () => alert("Imagem inválida.")
        reader.onload = (ev) => {
            let media = <string>ev.target!.result;
            sendMessage(<MessageData>{message: value, username: username, media: media})
        }
    }
</script>
<style>
    p {
        color: white;
        font-family: Arial, Helvetica, sans-serif;
    }
    .bottom {
        display: flex;
        flex-direction: column;
        margin-top: auto;
        padding: 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.2); 
        background: rgba(18, 18, 18, 0.9); 
    }
    .chat {
        display: flex;
        flex-flow: column;
        align-items: center;
        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-color: dimgray transparent;
    }
    .bytes-counter {
        display: inline;
    }
    .bytes-counter:not(:last-child)::after {
        content: " | ";
    }
    small {
        display: block;
        font-size: 0.5em;
    }
    .input-container {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
    }
    input[type=text] {
        flex: 1;
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        background-color: rgba(30, 30, 30, 0.8);
        color: white;
        font-size: 1rem;
        width: 100%;
    }
    .name-input {
        flex: 0.25 !important;
    }
    .msg-input {
        padding-right: 50px;
    }
    button {
        flex: 0;
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        background-color: #0025aa; 
        color: #fff;
        font-size: 1rem;
        cursor: pointer;
        width: 100%;
    }
    button:disabled {
        background-color: #3f3f3f;
        cursor: not-allowed;
    }
    .message {
        width: 95%;
        margin-top: 5px;
        margin-bottom: 5px;
        padding: 10px 10px 10px 10px;
        border-radius: 10px 10px;
        word-wrap: break-word;
        background-color: rgba(60, 60, 60, 0.8);
        overflow: hidden;
        flex-shrink: 0;
    }
    .message > img {
        object-fit: contain;
        max-width: 250px;
        max-height: 250px;
    }
    .mob-name-container {
        visibility: hidden;
        opacity: 0;
        transition: opacity 0.5s ease;
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
    }
    .mob-name {
        position: absolute;
        text-align: center;
        left: 50%;
        top: 50%;
        width: 75% !important;
        transform: translate(-50%, -50%);
    }
    .media-button {
        position: relative;
        margin-left: -55px;
        background-image: url("/media.svg");
        background-color: transparent;
        background-position: center;    
        background-repeat: no-repeat;
        background-size: 35px 35px;
    }
    .media-bar {
        transform: translateY(100%);
        transition: transform 0.25s;
        background-color: rgba(30, 30, 30, 1);
        border-radius: 5px;
        border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .media-image {
        display: flex;
        align-items: center;
    }
    .media-image > input[type=button] {
        border: none;
        border-radius: 8px;
        width: 40px;
        height: 40px;
        background-color: #0025aa; 
        background-image: url("/image.svg");
        background-size: 90%, 90%;
        background-repeat: no-repeat;
        background-position-x: center;
        background-position-y: calc(50% + 1px);
        cursor: pointer;
        color: #fff;
    }
    .media-image > p {
        margin: 0;
        margin-left: 10px;
        margin-right: 5px;
    }
    input[type=file] {
        display: none;
    }
    .media-bar-container {
        overflow-y: hidden;
        position: absolute;
        right: calc(50% - 20px);
        bottom: 100%;
    }
    @media (max-width: 600px) {
        .icon-button, .name-input {
            border-radius: 50% !important;
            padding: 0 22.33px !important;
            font-size: 0 !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
        }
        .send {
            background-image: url("/send.svg");
            background-size: 30px 30px;
        }
        .name-button, .name-input {
            background-image: url("/name.svg") !important;
            background-position-y: calc(50% + 2px) !important;
            background-size: 35px 35px !important;
        }
        .name-input {
            flex: 0 !important;
            border: none !important;
            background-color: #0025aa !important; 
        }
        .bytes-counter {
            margin: 0;
            display: block;
        }
        .bytes-counter:not(:last-child)::after {
            content: "";
        }
    }
</style>
<svelte:window bind:innerWidth={innerWidth} />

<div class="mob-name-container" bind:this={mobNameContainer} >
    <input type="text" class="mob-name" placeholder="Nome" bind:this={mobName} on:focusout={()=>showMobNameContainer(false)} on:keypress={mobNameInputKey} bind:value={username}>
</div>
<div class="chat" bind:this={chat}>
    {#each messages as message}
        <p class="message">
            <b>{message.username}:</b> {#if message.message}{message.message}{/if} <small>&lt;{message.identifier}&gt;</small>
            {#if message.media}
                <img src={message.media} alt="">
            {/if}
        </p>
    {/each}
</div>
<div class="bottom">
    <div class="input-container">
        {#if innerWidth < 600}
            <button class="icon-button name-button" on:click={()=>showMobNameContainer(true)}></button>
        {:else}
            <input type="text" class="name-input" placeholder="Nome" bind:value={username}>
        {/if}
        <input type="text" class="msg-input" placeholder="Mensagem" on:keypress={inputKey} bind:value={value}>
        <button class="media-button" on:click={()=>showMedia(true)}>
            <div class="media-bar-container">
                <div class="media-bar" bind:this={mediaBar}>
                    <input type="file" accept="image/*" bind:files={imageFiles} bind:this={mediaImageInput}>
                    <div class="media-image">
                        <input type="button" on:click={()=>mediaImageInput.click()}>
                        <p>Imagem</p>
                    </div>
                </div>
            </div>
        </button>
        <button on:click={send} disabled={!isValidToSend(value)} class="icon-button send">Enviar</button>
    </div>
    <div class="bytes-counter-container">
        <p class="bytes-counter">Bytes Recebidos: {bytesRecv}</p>
        <p class="bytes-counter">Bytes Enviados: {bytesSent}</p>
    </div>
</div>

