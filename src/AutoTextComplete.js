import './auto-text-complete.css';
import React, {useState} from 'react';
import _ from 'lodash';


const AutoTextComplete = () => {
    const [inputText, setInputText] = useState('')
    const [words, setWords] = useState([])
    const [synonyms, setSynonyms] = useState('')
    const [lookup, setLookup] = useState('')

    const onChange = (event) => {
        const {value} = event.target
        setInputText(value)
        if (value === '') {
            setWords([])
        }
        if (value) {
            try {
                setTimeout(() => {
                    console.log('Fetching Suggestions for Prefix...')
                    fetch(`http://3.137.87.165:5001/prefix/${value}/3`, {mode: 'cors'})
                        .then(res => res.json())
                        .then(data => {
                            let tempWords = []
                            for (const [key] of Object.entries(data)) {
                                tempWords.push(key)
                            }
                            setWords(tempWords)
                        })
                }, 500)
            } catch (error) {
                console.log(error);
            }
        }
    };


    const onClick = (event) => {
        const {textContent} = event.target
        if (textContent) {
            try {
                console.log('Fetching Description for Word...')
                setLookup(textContent)
                fetch(`http://3.137.87.165:5001/details/${textContent}`, {mode: 'cors'})
                    .then(res => res.json())
                    .then(data => {
                        // console.log(JSON.stringify(data));
                        setSynonyms(data);
                    })
            } catch (error) {
                console.log(error);
            }
        }
    };

    const onEnter = (event) => {
        const {value} = event.target
        if (value) {
            try {
                console.log('Fetching Description for Word...')
                setLookup(value)
                fetch(`http://3.137.87.165:5001/details/${value}`, {mode: 'cors'})
                    .then(res => res.json())
                    .then(data => {
                        // console.log(JSON.stringify(data));
                        setSynonyms(data);
                    })
            } catch (error) {
                console.log(error);
            }
        }
    };

    const renderList = (word, index) => {
        return (
            <li className={'dropdown-item'} value={word} key={index} onClick={(e) => onClick(e)}>
                <label>{word}</label>
            </li>
        )
    }

    return (
        <div>
            <div className='header'>
                <h2>Shakespearean Auto-Complete</h2>
            </div>
            <div className='auto-text-dropdown-container'>
                <div className='auto-text-field'>
                    <input type="text" id="auto-text" name="auto-text" onChange={(e) => onChange(e)} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onEnter(e)
                        }
                    }}></input>
                    {inputText && <div className='auto-text-field-dropdown'>
                        <ul className='dropdown-items'>
                            {
                                words && words.length > 0 && words.map((word, index) => {
                                    return (
                                        renderList(word, index)
                                    )
                                })
                            }
                        </ul>
                    </div>}
                </div>
            </div>
            <div className='footer'>
                {synonyms && typeof (synonyms[0]) == "string" ?
                    <div>
                        <h3 style={{color: "red"}}>Couldn't find definition for '{lookup}'.</h3>
                        <h2>Similar words:</h2>
                    </div>
                    : synonyms && synonyms[0].meta && synonyms[0].meta.id.toLowerCase() === lookup.toLowerCase() ?
                        <div>
                            <h2>{lookup}'s Definition:</h2>
                            <hr style={{height: "3px", backgroundColor: "black"}}></hr>
                        </div>
                        : synonyms && synonyms[0].meta ?
                            <div>
                                <h3 style={{color: "red"}}>Couldn't find word '{lookup}'.</h3>
                                <h2>But here's {synonyms[0].meta.id}'s Definition:</h2>
                                <hr style={{height: "3px", backgroundColor: "black"}}></hr>
                            </div>
                            :
                            <div></div>
                }
                {synonyms && typeof (synonyms[0]) == "string" ?
                    <div>
                        <p>{_.join(synonyms, ', ')} </p>
                    </div>
                    : (synonyms) ? synonyms.map((sense, id) => {
                            // console.log("Word:" + sense.hwi.hw);
                            // console.log("Part of Speech:" + sense.fl);
                            // console.log("Definition:" + sense.shortdef);
                            // console.log("Synonyms:\n\t" + _.join(sense.meta.syns[0], ', '));
                            return (
                                <div key={id}>
                                    <p><b>{sense.hwi.hw}</b> ({sense.fl})</p>
                                    <p><i>Definition</i>: {sense.shortdef}</p>
                                    <p><i>Synonyms</i>: {_.join(sense.meta.syns[0], ', ')}</p>
                                    <hr style={{height: "2px", backgroundColor: "#30799B"}}></hr>
                                </div>
                            )
                        })
                        :
                        <div></div>
                }
            </div>
        </div>
    );
}

export default AutoTextComplete;
