export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "48px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "16px",
            color: "#1a1a1a",
          }}
        >
          Chat Application
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "#666",
            marginBottom: "32px",
            lineHeight: "1.6",
          }}
        >
          Connect to chat with an AI assistant specialized in Roman history.
          Enter your nickname and start chatting!
        </p>
        <a
          href="/chat"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            background: "#2563eb",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Go to Chat
        </a>
      </div>
    </div>
  );
}
