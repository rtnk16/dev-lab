"""Render the English/Japanese guide's PNGs using Graphviz (no Python packages)."""

from pathlib import Path
import shutil
import subprocess


OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "agent_architecture"
COLORS = {
    "model": "#EDE9FE",
    "harness": "#DBEAFE",
    "tool": "#D1FAE5",
    "data": "#FEF3C7",
    "neutral": "#F1F5F9",
}


def quote(value):
    return '"' + value.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n') + '"'


def node(identifier, label, role="neutral"):
    return f'{identifier} [label={quote(label)}, fillcolor="{COLORS[role]}"];'


def edge(start, end, label="", dashed=False, head=None, tail=None):
    attributes = 'style=dashed, constraint=false' if dashed else 'style=solid'
    if head:
        attributes += f", lhead=cluster_{head}"
    if tail:
        attributes += f", ltail=cluster_{tail}"
    return f'{start} -> {end} [label={quote(label)}, {attributes}];'


def cluster(identifier, label, content):
    return (
        f'subgraph cluster_{identifier} {{ label={quote(label)}; '
        'color="#CBD5E1"; style="rounded"; margin=22; fontsize=16; labeljust=l; '
        + "\n".join(content)
        + "\n}"
    )


def overview(jp):
    return "\n".join([
        node("user", "あなた\n『バグを直して』" if jp else 'You\n"Fix this bug"'),
        cluster("agent", "AIエージェント = 作業を進める仕組み全体" if jp else "AI agent = the system doing the work", [
            node("harness", "ハーネス\n情報・実行・進捗を管理する" if jp else "Harness\nManage input, execution, and progress", "harness"),
            node("llm", "LLM\n次の操作・回答を生成する" if jp else "LLM\nGenerate the next action or answer", "model"),
            node("tool", "ツール\n読む・編集する・テストする" if jp else "Tools\nRead, edit, and test", "tool"),
            edge("harness", "llm", "① 必要な情報" if jp else "1. Relevant input"),
            edge("llm", "harness", "② 操作の要求" if jp else "2. Operation request"),
            edge("harness", "tool", "③ 許可された操作" if jp else "3. Permitted operation"),
            edge("tool", "harness", "④ 実行結果" if jp else "4. Execution result"),
        ]),
        edge("user", "harness", "依頼" if jp else "Request", head="agent"),
        edge("harness", "user", "回答・成果物" if jp else "Answer and artifacts", True, tail="agent"),
    ])


def context(jp):
    return "\n".join([
        cluster("sources", "利用できる情報の保管先" if jp else "Available information stores", [
            node("history", "保存された会話" if jp else "Stored conversation", "data"),
            node("files", "作業フォルダーのファイル" if jp else "Workspace files", "data"),
            node("external", "外部の文書・Issue" if jp else "External documents and issues", "data"),
        ]),
        node("select", "ホスト / ハーネス\n選ぶ・読む・必要なら要約する" if jp else "Host / harness\nSelect, read, and summarize as needed", "harness"),
        node("input", "今回のコンテキスト\n指示 + 依頼 + 抜粋 + ツール結果" if jp else "Current context\nInstructions + request + excerpts + results", "data"),
        node("llm", "LLM\n今回渡された情報で推論" if jp else "LLM\nInfer from the supplied input", "model"),
        edge("history", "select"), edge("files", "select"), edge("external", "select"),
        edge("select", "input", "必要な部分だけ" if jp else "Relevant parts"),
        edge("input", "llm", "モデルに渡す" if jp else "Model input"),
    ])


def mcp(jp):
    return "\n".join([
        cluster("host", "AIアプリ（ホスト）" if jp else "AI application (host)", [
            node("harness", "ハーネス\n要求を確認し、結果を受け取る" if jp else "Harness\nCheck requests and receive results", "harness"),
            node("client", "MCPクライアント\n接続を管理する" if jp else "MCP client\nManage the connection", "harness"),
            edge("harness", "client", "検索要求" if jp else "Search request"),
        ]),
        cluster("server", "ローカル または リモート" if jp else "Local or remote", [
            node("server", "MCPサーバー\n検索などの機能を公開する" if jp else "MCP server\nExpose search and other capabilities", "tool"),
        ]),
        node("service", "Issue管理サービス\n認証・権限に従って検索" if jp else "Issue service\nSearch within authorized scope", "data"),
        edge("client", "server", "MCP\n共通の接続ルール" if jp else "MCP\nShared connection rules", head="server"),
        edge("server", "service", "サービスのAPI" if jp else "Service API"),
        edge("service", "server", "Issueの抜粋" if jp else "Issue excerpts", True),
        edge("server", "client", "検索結果" if jp else "Search results", True, tail="server"),
        edge("client", "harness", "コンテキストへ" if jp else "Into context", True),
    ])


def runtime(jp):
    return "\n".join([
        cluster("pc", "① 手元のPC" if jp else "1. Your PC", [
            node("host", "CLI / ホスト / ハーネス\n依頼を受け、作業を管理する" if jp else "CLI / host / harness\nReceive goals and manage work", "harness"),
        ]),
        cluster("provider", "② モデル提供元のサーバー" if jp else "2. Model provider's server", [
            node("llm", "LLM\n入力から出力を生成する" if jp else "LLM\nGenerate output from input", "model"),
        ]),
        cluster("workspace", "③ クラウドの作業環境（例: コンテナ）" if jp else "3. Cloud workspace (e.g. a container)", [
            node("shell", "シェル用ツール\nコマンドを実行する" if jp else "Shell tool\nExecute commands", "tool"),
            node("files", "ファイル / Python / pytest\nここで編集・テストする" if jp else "Files / Python / pytest\nEdits and tests happen here", "data"),
            edge("shell", "files", "操作" if jp else "Operate"),
        ]),
        edge("host", "llm", "コンテキストを送信" if jp else "Send context", head="provider"),
        edge("llm", "host", "操作要求・回答" if jp else "Requests and answers", True, tail="provider"),
        edge("host", "shell", "許可されたコマンド" if jp else "Permitted command", head="workspace"),
        edge("shell", "host", "終了コード・ログ" if jp else "Exit code and logs", True, tail="workspace"),
    ])


def render():
    if not shutil.which("dot"):
        raise SystemExit("Graphviz is required: install it so that 'dot' is on PATH.")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for language, jp in [("en", False), ("jp", True)]:
        for name, diagram in [("overview", overview), ("context", context), ("mcp", mcp), ("runtime", runtime)]:
            title = {
                "overview": ("役割の全体像", "Who does what?"),
                "context": ("ある情報と、渡される情報は違う", "Stored information vs. supplied context"),
                "mcp": ("MCPは機能につなぐ接続の仕組み", "MCP connects applications to capabilities"),
                "runtime": ("同じ作業でも、動く場所は分かれる", "One task, several execution locations"),
            }[name][0 if jp else 1]
            font = "Noto Sans CJK JP" if jp else "DejaVu Sans"
            source = (
                'digraph G {\n'
                f'graph [rankdir=TB, compound=true, bgcolor="white", pad=0.3, nodesep=0.5, ranksep=0.55, '
                f'dpi=150, fontname={quote(font)}, fontsize=22, labelloc=t, label={quote(title)}];\n'
                f'node [shape=box, style="rounded,filled", fontname={quote(font)}, fontsize=16, '
                'fontcolor="#0F172A", color="#94A3B8", penwidth=1.2, margin="0.22,0.16"];\n'
                f'edge [fontname={quote(font)}, fontsize=13, color="#64748B", '
                'fontcolor="#334155", arrowsize=0.8];\n'
                + diagram(jp)
                + '\n}\n'
            )
            destination = OUTPUT / f"{name}_{language}.png"
            subprocess.run(["dot", "-Tpng", "-o", str(destination)], input=source, text=True, check=True)
            print(destination.relative_to(OUTPUT.parent.parent))


if __name__ == "__main__":
    render()
