import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ProblemSolve() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [language, setLanguage] =
        useState("JavaScript");

    const [selectedTime, setSelectedTime] =
        useState(30);

    const [started, setStarted] =
        useState(false);

    const [seconds, setSeconds] =
        useState(1800);

    const [code, setCode] =
        useState(`function twoSum(nums,target){

}`);

    const [output, setOutput] =
        useState("Run code to see output");

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

    function startChallenge() {

        setSeconds(
            selectedTime * 60
        );

        setStarted(true);

    }

    useEffect(() => {

        if (!started) return;

        const timer =
            setInterval(() => {

                setSeconds(prev =>
                    prev > 0
                        ?
                        prev - 1
                        :
                        0
                );

            }, 1000);

        return () => clearInterval(
            timer
        );

    }, [started]);

    const mins =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;

    return (

        <div style={s.page}>


            <div style={s.left}>


                <div style={s.topbar}>

                    <button
                        style={s.back}
                        onClick={() =>
                            navigate("/problem")
                        }
                    >

                        ← Problems

                    </button>


                    <div style={s.id}>
                        Problem #{id}
                    </div>

                </div>


                <h1 style={s.title}>
                    Two Sum
                </h1>


                <div style={s.badges}>

                    <span style={s.easy}>
                        Easy
                    </span>

                    <span style={s.tag}>
                        Array
                    </span>

                    <span style={s.tag}>
                        Hash Table
                    </span>

                </div>


                <div style={s.descCard}>

                    <h3>Description</h3>

                    <p>

                        Given an array of integers nums and an integer target,
                        return indices of two numbers that add up to target.

                    </p>

                </div>



                <div style={s.exampleCard}>

                    <h4>Example</h4>

                    <pre>

                        Input:
                        nums=[2,7,11,15]

                        target=9

                        Output:
                        [0,1]

                    </pre>

                </div>


                <div style={s.constraints}>

                    <h4>Constraints</h4>

                    <ul>

                        <li>2 ≤ nums.length ≤ 10⁴</li>

                        <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>

                        <li>Only one valid answer exists</li>

                    </ul>

                </div>

            </div>




            <div style={s.right}>


                <div style={s.editorTop}>


                    <select
                        value={language}
                        onChange={(e) =>
                            setLanguage(
                                e.target.value
                            )
                        }
                        style={s.select}
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

                        !started

                            ?

                            <div style={s.timerBox}>

                                <select
                                    style={s.select}
                                    value={selectedTime}
                                    onChange={(e) =>
                                        setSelectedTime(
                                            Number(
                                                e.target.value
                                            )
                                        )
                                    }
                                >

                                    <option value={10}>
                                        10 min
                                    </option>

                                    <option value={15}>
                                        15 min
                                    </option>

                                    <option value={30}>
                                        30 min
                                    </option>

                                    <option value={45}>
                                        45 min
                                    </option>

                                    <option value={60}>
                                        60 min
                                    </option>

                                </select>


                                <button
                                    style={s.start}
                                    onClick={
                                        startChallenge
                                    }
                                >

                                    Start

                                </button>

                            </div>

                            :

                            <div style={s.liveTimer}>

                                {mins}:

                                {String(
                                    secs
                                ).padStart(
                                    2,
                                    "0"
                                )}

                            </div>

                    }


                </div>


                <textarea
                    style={s.editor}
                    value={code}
                    onChange={(e) =>
                        setCode(
                            e.target.value
                        )
                    }
                />



                <div style={s.bottom}>

                    <div style={s.output}>

                        {output}

                    </div>


                    <div style={s.buttons}>


                        <button
                            style={s.run}
                            onClick={() =>
                                setOutput(
                                    "Code executed successfully."
                                )
                            }
                        >

                            Run

                        </button>


                        <button
                            style={s.submit}
                            onClick={() =>
                                setOutput(
                                    "Solution submitted."
                                )
                            }
                        >

                            Submit

                        </button>


                    </div>

                </div>


            </div>


        </div>

    )

}



const s = {

    page: {
        height: "100vh",
        display: "grid",
        gridTemplateColumns:
            "45% 55%",
        background: "#e8e8e8"
    },

    left: {
        padding: "24px",
        overflow: "auto",
        background: "#f3f3f3"
    },

    right: {
        display: "flex",
        flexDirection: "column",
        background: "#fafafa",
        borderLeft:
            "1px solid #dcdcdc"
    },

    topbar: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px"
    },

    back: {
        padding: "10px 16px",
        border: "none",
        borderRadius: "12px",
        background: "#dcdcdc",
        cursor: "pointer"
    },

    id: {
        background: "#ddd",
        padding: "10px 14px",
        borderRadius: "10px"
    },

    title: {
        fontSize: "42px",
        marginBottom: "10px"
    },

    badges: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px"
    },

    easy: {
        background: "#dcefdc",
        padding: "6px 12px",
        borderRadius: "999px"
    },

    tag: {
        background: "#ddd",
        padding: "6px 12px",
        borderRadius: "999px"
    },

    descCard: {
        background: "#fff",
        padding: "20px",
        borderRadius: "16px",
        marginBottom: "16px"
    },

    exampleCard: {
        background: "#fff",
        padding: "20px",
        borderRadius: "16px",
        marginBottom: "16px"
    },

    constraints: {
        background: "#fff",
        padding: "20px",
        borderRadius: "16px"
    },

    editorTop: {
        display: "flex",
        justifyContent: "space-between",
        padding: "18px",
        background: "#f1f1f1"
    },

    select: {
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid #dcdcdc"
    },

    timerBox: {
        display: "flex",
        gap: "10px"
    },

    start: {
        padding: "12px 18px",
        background: "#222",
        color: "#fff",
        border: "none",
        borderRadius: "10px"
    },

    liveTimer: {
        padding: "12px 20px",
        background: "#222",
        color: "#fff",
        borderRadius: "10px"
    },

    editor: {
        flex: 1,
        border: "none",
        outline: "none",
        padding: "25px",
        fontFamily: "monospace",
        fontSize: "15px",
        background: "#fcfcfc"
    },

    bottom: {
        padding: "18px",
        background: "#f3f3f3"
    },

    output: {
        background: "#fff",
        padding: "14px",
        borderRadius: "12px",
        marginBottom: "15px"
    },

    buttons: {
        display: "flex",
        gap: "10px"
    },

    run: {
        padding: "12px 20px",
        border: "1px solid #222",
        background: "#fff",
        borderRadius: "10px"
    },

    submit: {
        padding: "12px 20px",
        border: "none",
        background: "#222",
        color: "#fff",
        borderRadius: "10px"
    }

};