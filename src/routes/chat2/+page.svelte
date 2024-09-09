<script lang="ts">
    import { onMount } from "svelte";
    import type { MessageData } from "$lib/lib";

    let value: string;
    let username: string;
    let socket: WebSocket = <any>undefined;
    let bytesRecv = 0;
    let bytesSent = 0;
    let chat: HTMLDivElement;
    let messages: MessageData[] = [];
    let mediaRecorder: MediaRecorder;
    let audioChunks: Blob[] = [];

    onMount(() => {
        socket = new WebSocket("ws://26.168.198.241:3000");

        socket.addEventListener("message", (ev) => {
            let msg: MessageData;
            try {
                msg = JSON.parse(ev.data);
            } catch (e) {
                return;
            }

            if (msg.type === 'audio') {
                // Reproduz o áudio
                const audioBlob = new Blob([new Uint8Array(ev.data)], { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();
            } else {
                bytesRecv += (ev.data as string).length;
                msg.username = msg.username ? msg.username : "Anônimo";
                messages.push(msg);
                messages = [...messages];
            }
        });

        new MutationObserver(() => chat.scrollTop = chat.scrollHeight).observe(chat, { childList: true });
    });

    function send() {
        if (!isValidToSend(value)) return;

        let msg = JSON.stringify({ message: value, username: username } as MessageData);
        bytesSent += msg.length;
        socket.send(msg);
        value = "";
    }

    function isValidToSend(val: string): boolean {
        return !!val && !!username;
    }

    function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    sendAudio(audioBlob);
                    audioChunks = [];
                };
                mediaRecorder.start();
            })
            .catch(err => console.error('Erro ao acessar o microfone:', err));
    }

    function stopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
    }

    function sendAudio(audioBlob: Blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const audioArrayBuffer = reader.result as ArrayBuffer;
            socket.send(audioArrayBuffer);
            bytesSent += audioArrayBuffer.byteLength;
        };
        reader.readAsArrayBuffer(audioBlob);
    }
</script>

<style>
    .bori {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background: linear-gradient(to bottom right, #0d021d, #150725, #11021a, #0b000c);
        color: #e6e6e6;
        height: 100vh;
        overflow: hidden;
    }

    .container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        max-width: 650px;
        margin: 0 auto;
        border: 1px solid #ffffff21;
        border-radius: 10px;
        background-color: #00000031;
        box-shadow: -1px 19px 10px -6px rgba(0, 0, 0, 0.13);
    }

    .chat {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .bottom {
        display: flex;
        flex-direction: column;
        padding: 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(18, 18, 18, 0.9);
    }

    .input-container {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
    }

    input {
        flex: 1;
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        background-color: rgba(30, 30, 30, 0.8);
        color: #fff;
        font-size: 1rem;
    }

    button {
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        background-color: #6200ea;
        color: #fff;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    button:disabled {
        background-color: #3f3f3f;
        cursor: not-allowed;
    }

    button:hover:not(:disabled) {
        background-color: #3700b3;
    }

    .message {
        margin-bottom: 12px;
        padding: 12px;
        border-radius: 8px;
        background-color: rgba(60, 60, 60, 0.8);
    }

    .message p {
        margin: 0;
        font-size: 1rem;
    }

    .message small {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
    }

    .system-message {
        color: #b0b0b0;
        font-style: italic;
    }

    .bytes-counter-container {
        display: flex;
        gap: 10px;
    }

    .bytes-counter {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
    }
</style>

<body class="bori">
    <div class="container">
        <div class="chat" bind:this={chat}>
            {#each messages as message}
                <div class={`message ${message.username === "Sistema" ? 'system-message' : ''}`}>
                    <p><strong>{message.username}:</strong> {message.message}</p>
                    {#if message.identifier && message.username !== "Sistema"}
                        <small>&lt;{message.identifier}&gt;</small>
                    {/if}
                </div>
            {/each}
        </div>
        <div class="bottom">
            <div class="input-container">
                <input type="text" placeholder="Nome" bind:value={username}>
                <input type="text" placeholder="Mensagem" bind:value={value}>
                <button on:click={send} disabled={!isValidToSend(value)}>Enviar</button>
                <button on:click={startRecording} disabled={!isValidToSend(username)}>Gravar Áudio</button>
                <button on:click={stopRecording} disabled={!isValidToSend(username)}>Parar Gravação</button>
            </div>
            <div class="bytes-counter-container">
                <p class="bytes-counter">Bytes Recebidos: {bytesRecv}</p>
                <p class="bytes-counter">Bytes Enviados: {bytesSent}</p>
            </div>
        </div>
    </div>
</body>
