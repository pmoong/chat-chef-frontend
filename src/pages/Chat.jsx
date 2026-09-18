import React, { useEffect, useState } from "react";
import MessageBox from "../components/MessageBox";
import PrevButton from "../components/PrevButton";
import { MoonLoader } from "react-spinners";

const Chat = ({ ingredientList }) => {
  // logic
  // console.log("재료찍어보기: ", ingredientList);
  const endpoint = process.env.REACT_APP_SERVER_ADDRESS;

  const [value, setValue] = useState("");

  // TODO: set함수 추가하기
  // const [messages] = useState([]); // chatGPT와 사용자의 대화 메시지 배열

  const [infoMessages, setInfoMessages] = useState([]); // 초기세팅 메시지
  const [messages, setMessages] = useState([]); // chatGPT와 사용자의 대화 메시지 배열

  const [isInfoLoading, setIsInfoLoading] = useState(true); // 최초 정보 요청시 로딩
  const [isMessageLoading, setIsMessageLoading] = useState(false); // 사용자와 메시지 주고 받을때 로딩
  const hadleChange = (event) => {
    const { value } = event.target;
    console.log("value==>", value);
    setValue(value);
  };

  const sendMessage = async (userMessage, allMessages) => {
    // "/messge"API 호출 및 관련 state업데이트
    setIsMessageLoading(true);
    try {
      const response = await fetch(`${endpoint}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage, messages: allMessages }),
      });

      const result = await response.json();
      console.log("🚀 ~ result:", result);

      // 응답받은 답변을 대화 목록에 추가
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.data.content,
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsMessageLoading(false);
    }
  };

  const hadleSubmit = (event) => {
    event.preventDefault();
    console.log("메시지 보내기");
    // 1. userMessage (현재 사용자가 입력한 메시지 정보)
    const userMessage = {
      role: "user",
      content: value.trim(),
    };
    // 2. messages (기존 대화 목록)
    const allMessages = [...infoMessages, ...messages];

    // State관리
    // prev: 기존 대화 목록 (배열)
    setMessages((prev) => [...prev, userMessage]);

    // 메시지 초기화
    setValue("");

    // api 호출
    sendMessage(userMessage, allMessages);
  };

  const sendInfo = async (data) => {
    setIsInfoLoading(true);
    try {
      const response = await fetch(`${endpoint}/recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientList: data,
        }),
      });

      const result = await response.json();
      console.log("result: ", result);
      // 데이터 안들어올 경우 처리
      if (!result.data) return;

      // 마지막요소제거된메시지배열
      const removeLastDataList = result.data.filter(
        (_, index, array) => array.length - 1 !== index,
      );

      // 초기메시지 배열에 저장
      setInfoMessages(removeLastDataList);
      // 첫 assistant답변 UI에 추가
      const { role, content } = result.data[result.data.length - 1];

      // prev: 배열
      setMessages((prev) => [...prev, { role, content }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsInfoLoading(false);
    }
  };
  useEffect(() => {
    sendInfo(ingredientList);
  }, []);

  // view
  return (
    <div className="w-full h-full px-6 pt-10 break-keep overflow-auto">
      {isInfoLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MoonLoader color="#46A195" />
          </div>
        </div>
      )}

      {/* START: 로딩 스피너 */}
      {/* START:뒤로가기 버튼 */}
      <PrevButton />
      {/* END:뒤로가기 버튼 */}
      <div className="h-full flex flex-col">
        {/* START:헤더 영역 */}
        <div className="-mx-6 -mt-10 py-7 bg-chef-green-500">
          <span className="block text-xl text-center text-white">
            맛있는 쉐프
          </span>
        </div>
        {/* END:헤더 영역 */}
        {/* START:채팅 영역 */}
        <div className="overflow-auto">
          <MessageBox messages={messages} isLoading={isMessageLoading} />
        </div>
        {/* END:채팅 영역 */}
        {/* START:메시지 입력 영역 */}
        <div className="mt-auto flex py-5 -mx-2 border-t border-gray-100">
          <form
            id="sendForm"
            className="w-full px-2 h-full"
            onSubmit={hadleSubmit}
          >
            <input
              className="w-full text-sm px-3 py-2 h-full block rounded-xl bg-gray-100 focus:"
              type="text"
              name="message"
              value={value}
              onChange={hadleChange}
            />
          </form>
          <button
            type="submit"
            form="sendForm"
            className="w-10 min-w-10 h-10 inline-block rounded-full bg-chef-green-500 text-none px-2 bg-[url('../public/images/send.svg')] bg-no-repeat bg-center"
          >
            보내기
          </button>
        </div>
        {/* END:메시지 입력 영역 */}
      </div>
    </div>
  );
};

export default Chat;
