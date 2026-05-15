import { useNavigate } from "react-router-dom";

export default function Leaderboard() {

    const navigate = useNavigate();

    const players = [

        {
            rank: 1,
            name: "ShadowByte",
            rating: 2540,
            wins: 132
        },

        {
            rank: 2,
            name: "CodeTitan",
            rating: 2430,
            wins: 119
        },

        {
            rank: 3,
            name: "AlgoKing",
            rating: 2320,
            wins: 104
        },

        {
            rank: 4,
            name: "ByteHunter",
            rating: 2250,
            wins: 97
        },

        {
            rank: 5,
            name: "You",
            rating: 1200,
            wins: 0
        }

    ];

    return (

        <div style={s.page}>

            <div style={s.nav}>

                <div style={s.logo}>
                    Codex
                </div>

                <button
                    style={s.btn}
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >

                    Dashboard

                </button>

            </div>


            <div style={s.container}>

                <p style={s.label}>
// LEADERBOARD
                </p>

                <h1 style={s.title}>
                    Global Rankings
                </h1>


                <div style={s.card}>


                    <div style={s.header}>

                        <div>Rank</div>
                        <div>Player</div>
                        <div>Rating</div>
                        <div>Wins</div>

                    </div>


                    {
                        players.map(
                            p => (

                                <div
                                    key={p.rank}
                                    style={s.row}
                                >

                                    <div>
                                        #{p.rank}
                                    </div>

                                    <div>
                                        {p.name}
                                    </div>

                                    <div>
                                        {p.rating}
                                    </div>

                                    <div>
                                        {p.wins}
                                    </div>

                                </div>

                            ))
                    }

                </div>

            </div>

        </div>

    )

}



const s = {

    page: {
        minHeight: "100vh",
        background: "#f5f5f3"
    },

    nav: {
        height: "60px",
        background: "#fff",
        borderBottom:
            "1px solid #ebebea",

        display: "flex",

        justifyContent:
            "space-between",

        alignItems: "center",

        padding: "0 30px"
    },

    logo: {
        fontSize: "24px",
        fontWeight: "700"
    },

    btn: {
        padding: "12px 18px",
        background: "#111",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer"
    },

    container: {
        maxWidth: "1300px",
        margin: "40px auto"
    },

    label: {
        fontSize: "12px",
        letterSpacing: "2px",
        color: "#999"
    },

    title: {
        fontSize: "50px",
        marginBottom: "30px"
    },

    card: {
        background: "#fff",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid #ebebea"
    },

    header: {
        display: "grid",

        gridTemplateColumns:
            "150px 3fr 200px 200px",

        padding: "20px",

        fontWeight: "700",

        background: "#fafafa"
    },

    row: {
        display: "grid",

        gridTemplateColumns:
            "150px 3fr 200px 200px",

        padding: "20px",

        borderTop:
            "1px solid #f0f0f0"
    }

};