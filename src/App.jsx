import { useCallback, useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { FormButton, Grid } from "semantic-ui-react";
import { v4 as uuidv4 } from "uuid";
import "semantic-ui-css/semantic.min.css";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [botResponse, setBotResponse] = useState("");
  const [index, setIndex] = useState(0);

  const handleSubmit = () => {
    sendMessage(inputValue);

    setChatLog((prevChatLog) => [
      ...prevChatLog,
      { id: uuidv4(), type: "user", message: inputValue },
    ]);
    setInputValue("");
  };

  const sendMessage = async (message) => {
    setLoading(true);

    const options = {
      method: "POST",
      url: `${import.meta.env.VITE_APP_API_ACCESS_POINT}/summarygenerator`,
      withCredentials: false,
      headers: {
        "content-type": "application/json",
      },
      data: [
        {
          message,
        },
      ],
    };

    await axios
      .request(options)
      .then((response) => {
        setLoading(false);
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          { id: uuidv4(), type: "bot", message: response.data },
        ]);
      })

      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  // Function to handle the timeout
  const handleTimeout = useCallback(() => {
    if (chatLog[chatLog.length - 1].type === "bot")
      if (index < chatLog[chatLog.length - 1].message.length && !loading) {
        setBotResponse(
          (prevText) => prevText + chatLog[chatLog.length - 1].message[index]
        );
        setIndex((prevIndex) => prevIndex + 1);
      }
  }, [index, loading, chatLog]);

  useEffect(() => {
    const timeoutId = setTimeout(handleTimeout, 30);

    return () => clearTimeout(timeoutId);
  }, [handleTimeout]);

  return (
    <div className="content-container">
      {chatLog.length === 0 && (
        <div className="site_header">
          <h1>Quantum Swim</h1>
          <h3>Surf Google and use AI to inquire the latest information</h3>
        </div>
      )}
      <div className="output-container">
        <div>
          {chatLog.map((message, index) => (
            <div key={message.id} className="ui comments userComment">
              <div className="comment">
                <a className="avatar">
                  {/* <img src="/images/avatar/small/stevie.jpg"> */}
                </a>
                <div className="content">
                  <a className="author">
                    {message.type === "bot" ? "Bot" : "You"}
                  </a>
                  <div className="metadata">
                    <div className="date">2 days ago</div>
                  </div>
                  <div className="text">
                    {index % 2 !== 0 &&
                    index === chatLog.length - 1 &&
                    message.type === "bot"
                      ? botResponse
                      : message.message}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {loading && (
          <div className="loading-indicator">
            <div className="ui active inline loader  comment" />
          </div>
        )}
        <Grid>
          <Grid.Column width="14">
            <div className="textarea_container">
              <textarea
                onChange={handleChange}
                placeholder="Enter your message here"
                value={inputValue}
                rows={5}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.shiftKey) {
                    return;
                  }
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
              />
            </div>
          </Grid.Column>
          <Grid.Column className="send-button-container" width="2">
            <FormButton
              className="send-button"
              loading={loading}
              onClick={handleSubmit}
            >
              Submit
            </FormButton>
          </Grid.Column>
        </Grid>
      </div>
    </div>
  );
}

export default App;
