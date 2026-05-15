import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const problems = [

    {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        acceptance: "49.2%",
        tags: ["Array", "Hash Table"],
        timer: 15
    },

    {
        id: 2,
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        acceptance: "34.8%",
        tags: ["String", "Sliding Window"],
        timer: 30
    },

    {
        id: 3,
        title: "Merge K Sorted Lists",
        difficulty: "Hard",
        acceptance: "29%",
        tags: ["Heap", "Linked List"],
        timer: 45
    },

    {
        id: 4,
        title: "Valid Parentheses",
        difficulty: "Easy",
        acceptance: "42%",
        tags: ["Stack"],
        timer: 10
    },

    {
        id: 5,
        title: "LRU Cache",
        difficulty: "Medium",
        acceptance: "33%",
        tags: ["Design", "HashMap"],
        timer: 35
    },

    {
        id: 6,
        title: "Word Break",
        difficulty: "Hard",
        acceptance: "37%",
        tags: ["DP"],
        timer: 45
    },

    {
        id: 7,
        title: "Maximum Subarray",
        difficulty: "Medium",
        acceptance: "50%",
        tags: ["Array", "DP"],
        timer: 20
    }

];


const languages = [

    "JavaScript",
    "Python",
    "Java",
    "C++",
    "C",
    "Go",
    "Rust",
    "TypeScript",
    "Kotlin",
    "Swift",
    "PHP"

];

export default function Problem() {

    const navigate =
        useNavigate();

    const [search, setSearch] =
        useState("");

    const [difficulty, setDifficulty] =
        useState("All");

    const [language, setLanguage] =
        useState("JavaScript");


    const filtered =
        useMemo(() => {

            return problems.filter(
                p => {

                    const searchMatch =
                        p.title
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            );

                    const diffMatch =

                        difficulty === "All"

                        ||

                        p.difficulty === difficulty;


                    return (
                        searchMatch &&
                        diffMatch
                    )

                })

        }, [
            search,
            difficulty
        ]);



    return (

        <div style={s.page}>


            <nav style={s.nav}>


                <div style={s.left}>


                    <div style={s.logoBox}>
                        CX
                    </div>

                    <div style={s.logo}>
                        Codex
                    </div>


                    <div style={s.links}>


                        <span
                            style={s.link}
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                        >
                            Dashboard
                        </span>


                        <span
                            style={{
                                ...s.link,
                                background: "#efefef",
                                color: "#111"
                            }}
                        >
                            Problems
                        </span>


                        <span
                            style={s.link}
                            onClick={() =>
                                navigate(
                                    "/leaderboard"
                                )
                            }
                        >
                            Leaderboard
                        </span>

                    </div>

                </div>


                <button
                    style={s.backBtn}
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    Back
                </button>


            </nav>



            <div style={s.container}>


                <p style={s.label}>
// PROBLEMS
                </p>


                <h1 style={s.title}>
                    Problem Set
                </h1>


                <p style={s.sub}>
                    Choose a question and solve it in your preferred language.
                </p>



                <div style={s.filterCard}>


                    <input
                        style={s.search}
                        placeholder=
                        "Search problems..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />


                    <div style={s.filters}>


                        <select
                            style={s.select}
                            value={language}
                            onChange={(e) =>
                                setLanguage(
                                    e.target.value
                                )
                            }
                        >

                            {
                                languages.map(
                                    l => (

                                        <option
                                            key={l}
                                        >
                                            {l}
                                        </option>

                                    ))
                            }

                        </select>


                        {
                            [
                                "All",
                                "Easy",
                                "Medium",
                                "Hard"
                            ].map(
                                level => (

                                    <button
                                        key={level}
                                        onClick={() =>
                                            setDifficulty(
                                                level
                                            )
                                        }

                                        style={{

                                            ...s.filter,

                                            background:
                                                difficulty === level
                                                    ?
                                                    "#111"
                                                    :
                                                    "#fff",

                                            color:
                                                difficulty === level
                                                    ?
                                                    "#fff"
                                                    :
                                                    "#111"

                                        }}

                                    >

                                        {level}

                                    </button>

                                ))
                        }

                    </div>

                </div>


                <div style={s.table}>


                    <div style={s.header}>

                        <div>#</div>

                        <div>Problem</div>

                        <div>Difficulty</div>

                        <div>Acceptance</div>

                        <div>Timer</div>

                        <div>Tags</div>

                    </div>


                    {
                        filtered.map(
                            p => (

                                <div
                                    key={p.id}
                                    style={s.row}

                                    onClick={() =>
                                        navigate(
                                            `/problem/${p.id}`
                                        )
                                    }
                                >

                                    <div>
                                        {p.id}
                                    </div>


                                    <div style={s.problem}>
                                        {p.title}
                                    </div>


                                    <div>

                                        <span
                                            style={{
                                                ...s.badge,

                                                background:

                                                    p.difficulty === "Easy"

                                                        ?
                                                        "#eef8f0"

                                                        :

                                                        p.difficulty === "Medium"

                                                            ?
                                                            "#fff7e8"

                                                            :
                                                            "#fff0f0",

                                                color:

                                                    p.difficulty === "Easy"

                                                        ?
                                                        "#16995c"

                                                        :

                                                        p.difficulty === "Medium"

                                                            ?
                                                            "#c97d00"

                                                            :
                                                            "#d33434"

                                            }}
                                        >

                                            {p.difficulty}

                                        </span>

                                    </div>


                                    <div>
                                        {p.acceptance}
                                    </div>


                                    <div>

                                        {p.timer}
                                        min

                                    </div>


                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 6,
                                            flexWrap: "wrap"
                                        }}
                                    >

                                        {
                                            p.tags.map(
                                                tag => (

                                                    <span
                                                        key={tag}
                                                        style={s.tag}
                                                    >
                                                        {tag}
                                                    </span>

                                                ))
                                        }

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
        background: "#f5f5f3",
        minHeight: "100vh"
    },

    nav: {
        height: "70px",
        background: "#fff",
        borderBottom: "1px solid #ececec",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px"
    },

    left: {
        display: "flex",
        alignItems: "center",
        gap: "15px"
    },

    logoBox: {
        width: "32px",
        height: "32px",
        border: "2px solid #111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: "700"
    },

    logo: {
        fontWeight: "700",
        fontSize: "25px"
    },

    links: {
        display: "flex",
        gap: "8px",
        marginLeft: "20px"
    },

    link: {
        padding: "9px 14px",
        borderRadius: "10px",
        cursor: "pointer",
        color: "#777"
    },

    backBtn: {
        padding: "12px 20px",
        background: "#111",
        color: "#fff",
        border: "none",
        borderRadius: "12px"
    },

    container: {
        maxWidth: "1450px",
        margin: "40px auto"
    },

    label: {
        fontSize: "11px",
        letterSpacing: "2px",
        color: "#aaa"
    },

    title: {
        fontSize: "60px"
    },

    sub: {
        color: "#888",
        marginBottom: "25px"
    },

    filterCard: {
        background: "#fff",
        padding: "20px",
        borderRadius: "18px",
        border: "1px solid #ebebea",
        marginBottom: "25px"
    },

    search: {
        width: "100%",
        padding: "16px",
        border: "1px solid #ececec",
        borderRadius: "12px",
        marginBottom: "15px"
    },

    filters: {
        display: "flex",
        gap: "10px",
        alignItems: "center"
    },

    select: {
        padding: "12px",
        border: "1px solid #ececec",
        borderRadius: "10px"
    },

    filter: {
        padding: "10px 18px",
        borderRadius: "999px",
        border: "1px solid #ececec"
    },

    table: {
        background: "#fff",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid #ececec"
    },

    header: {
        display: "grid",
        gridTemplateColumns:
            "70px 3fr 150px 150px 150px 2fr",
        padding: "20px",
        fontWeight: "700",
        background: "#fafafa"
    },

    row: {
        display: "grid",
        gridTemplateColumns:
            "70px 3fr 150px 150px 150px 2fr",
        padding: "20px",
        alignItems: "center",
        cursor: "pointer",
        borderTop: "1px solid #f0f0f0",
        transition: ".2s"
    },

    problem: {
        fontWeight: "700"
    },

    badge: {
        padding: "6px 10px",
        borderRadius: "999px"
    },

    tag: {
        padding: "6px 10px",
        background: "#f8f8f8",
        border: "1px solid #ececec",
        borderRadius: "999px",
        fontSize: "11px"
    }

}