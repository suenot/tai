import React, { useEffect, useState, useCallback, CSSProperties, useRef } from 'react';
import { LocalStoreProvider, useLocalStore } from '@deep-foundation/store/local';
import {
  Text,
  Stack,
  Card,
  CardBody,
  Heading,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
  TagLeftIcon,
} from '@chakra-ui/react';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { NavBar } from '../components/navbar';
import { Page } from '../components/page';
import startRecording from '../imports/capacitor-voice-recorder/strart-recording';
import stopRecording from '../imports/capacitor-voice-recorder/stop-recording';
import uploadRecords from '../imports/capacitor-voice-recorder/upload-records';
import createContainer from '../imports/capacitor-voice-recorder/create-container';
import loadRecords from '../imports/capacitor-voice-recorder/load-records';
import ChatBubble from '../components/ChatBubble';
const delay = (time) => new Promise(res => setTimeout(() => res(null), time));

function Content() {
  useEffect(() => {
    defineCustomElements(window);
  }, []);

  const deep = useDeep();
  const [lastPress, setLastPress] = useState<number>(0);
  const [linkToReplyId, setLinkToReplyId] = useState<number>(0);
  const [newConversationLinkId, setNewConversationLinkId] = useState<number>(0);
//let conversationLinkId;
  const [sounds, setSounds] = useLocalStore("Sounds", []);
  const [isRecording, setIsRecording] = useState(false);
  const [isChatClosed, setIsChatClosed] = useState<boolean>(false);
  const [isTimeEnded, setIsTimeEnded] = useState<boolean>(false);
  const [googleAuth, setGoogleAuth] = useLocalStore("googleAuth", undefined);
  const [systemMsg, setSystemMsg] = useLocalStore("systemMsg", undefined);
  // let newConversationLinkId;
  const [containerLinkId, setContainerLinkId] = useLocalStore(
    'containerLinkId',
    undefined
  );

  const [deviceLinkId, setDeviceLinkId] = useLocalStore<number>(
    'deviceLinkId',
    0
  );

  const startTime = useRef('');

  let replyMessageLinkId;

  useEffect(() => {
    new Promise(async () => {
      if (deep.linkId !== 0) {
        return;
      }
      await deep.guest();
    })
  }, [deep])

  useEffect(() => {
    if (!containerLinkId) {
      const initializeContainerLink = async () => {
        setContainerLinkId(await createContainer(deep));
      };
      initializeContainerLink();
    }
  }, [])

  const generalInfoCard = (
    <Card>
      <CardHeader>
        <Heading as={'h2'}>General Info</Heading>
      </CardHeader>
      <CardBody>
        <Text suppressHydrationWarning>
          Authentication Link Id: {deep.linkId ?? ' '}
        </Text>
        <Text suppressHydrationWarning>
          Device Link Id: {deviceLinkId ?? ' '}
        </Text>
      </CardBody>
    </Card>
  );

  let linkToReply;

  const handleClick = async () => {
    if (!isRecording) {
      // Start recording
      try {
        startTime.current = await startRecording();
        setIsRecording(true);
      } catch (error) {
        console.log('Error starting recording:', error);
      }
    } else {
      // Stop recording and process
      try {
        setLastPress(Date.now());   
        const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
        const transcribeTypeLinkId = await deep.id("@deep-foundation/google-speech", "Transcribe");
        const messageTypeLinkId = await deep.id('@deep-foundation/messaging', 'Message');
        const replyTypeLinkId = await deep.id('@deep-foundation/messaging', 'Reply');
        const transcriptionTypeLinkId = await deep.id("@deep-foundation/google-speech", "Transcription");
        const conversationTypeLinkId = await deep.id("@deep-foundation/chatgpt", "Conversation");
        const systemTypeLinkId = await deep.id("@deep-foundation/chatgpt", "System");
        const authorTypeLinkId = await deep.id('@deep-foundation/messaging', 'Author');
        const messagingTreeId = await deep.id('@deep-foundation/messaging', 'MessagingTree');
        const tokensTypeLinkId = await deep.id("@deep-foundation/tokens", "Tokens")
        console.log("1")
        const record = await stopRecording(deep, containerLinkId, startTime.current);
        console.log("2")
        const endTime = new Date().toLocaleDateString();
        console.log("3")
        //console.log("await uploadRecords(deep, containerLinkId, [{record, startTime, endTime}])",await uploadRecords(deep, containerLinkId, [{record, startTime, endTime}]))
        console.log("deep, containerLinkId, [{record, startTime, endTime}]",deep, containerLinkId, [{record, startTime, endTime}])
        console.log("[{record, startTime, endTime}]", [{record, startTime, endTime}])
        console.log("record, startTime, endTime", record, startTime, endTime)
        console.log("record", record)
        console.log("startTime", startTime)
        console.log("endTime" , endTime)
        const soundLinkId = await uploadRecords(deep, containerLinkId, [{record, startTime, endTime}])
        console.log("4")
        console.log("before insert sound link", sounds);
        console.log("flakeed2");
        console.log("flakeed1");
        console.log("soundLinkId", soundLinkId)
  
        console.log("googleauth", googleAuth);
  
        console.log("flakeed3");
  
        const { data: [{ id: transcribeTextLinkId }] } = await deep.insert({
          type_id: transcribeTypeLinkId,
          from_id: deep.linkId,
          to_id: soundLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: deep.linkId,
            }
          }
        });
        console.log("transcribeTextLinkId", transcribeTextLinkId)
  
        await delay(8000)
  
        const { data: [transcribedTextLinkId] } = await deep.select({
          type_id: transcriptionTypeLinkId,
          in: {
            type_id: containTypeLinkId,
            from_id: soundLinkId
          },
        });
  
        console.log("transcribedTextLinkId", transcribedTextLinkId)
  
        console.log("flakeed6");
        const { data: checkConversationLink } = await deep.select({
          type_id: conversationTypeLinkId,
          in: {
            type_id: containTypeLinkId,
            from_id: deep.linkId,
          },
        });
        console.log("checkConversationLink",checkConversationLink)

        if (!checkConversationLink || checkConversationLink.length === 0) {
          console.log("newConversationLinkId")
          const { data: [{ id: conversationLinkId }] } = await deep.insert({
            type_id: conversationTypeLinkId,
            string: { data: { value: "New chat" } },
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              },
            },
          });
          console.log("flakeed7");

          const { data: [{ id: systemMessageLinkId }] } = await deep.insert({
            type_id: messageTypeLinkId,
            string: { data: { value: systemMsg } },
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              }
            },
          });
          console.log("systemMsg", systemMsg)
  
          const { data: [{ id: systemMessageToConversationLinkId }] } = await deep.insert({
            type_id: systemTypeLinkId,
            from_id: systemMessageLinkId,
            to_id: conversationLinkId,
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              },
            },
          });

  
          const { data: [{ id: messageLinkId }] } = await deep.insert({
            type_id: messageTypeLinkId,
            string: { data: { value: "who are you" } },
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              }
            },
          });
  
          const { data: [{ id: replyToMessageLinkId }] } = await deep.insert({
            type_id: replyTypeLinkId,
            from_id: messageLinkId,
            to_id: conversationLinkId,
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              },
            },
          });
        }else{ 
        const sortedData = checkConversationLink.sort((a, b) => b.id - a.id);
        console.log("sortedData",sortedData)
        setNewConversationLinkId (sortedData[0].id)
      }
console.log("isChatClosed",isChatClosed)
if (newConversationLinkId) {
        if ( isTimeEnded || isChatClosed) {
console.log("isChatClosed",isChatClosed)
          setIsChatClosed(false)
          console.log("flakeed7");
  
          const { data: [{ id: systemMessageLinkId }] } = await deep.insert({
            type_id: messageTypeLinkId,
            string: { data: { value: systemMsg } },
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              }
            },
          });
          console.log("systemMsg", systemMsg)

          const { data: [{ id: systemMessageToConversationLinkId }] } = await deep.insert({
            type_id: systemTypeLinkId,
            from_id: systemMessageLinkId,
            to_id: newConversationLinkId,
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              },
            },
          });
  
          const { data: [{ id: messageLinkId }] } = await deep.insert({
            type_id: messageTypeLinkId,
            string: { data: { value: "who are you" } },
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              }
            },
          });
  
          const { data: [{ id: replyToMessageLinkId }] } = await deep.insert({
            type_id: replyTypeLinkId,
            from_id: messageLinkId,
            to_id: newConversationLinkId,
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              },
            },
          });
          replyMessageLinkId = replyToMessageLinkId;
          setIsTimeEnded(false)
        }else  {
            console.log("timeDifferenceInSeconds <= 15 || !isChatClose")
          const { data: replyLinks } = await deep.select({
            type_id: replyTypeLinkId,
          });

          const replyLink = replyLinks.sort((a, b) => {
            if (b.id !== undefined && a.id !== undefined) {
                return b.id - a.id;
            } else {
                return 0;
            }
        });

        linkToReply=replyLink[0].from_id;
        console.log("linkToReply",linkToReply)
        if (linkToReply && linkToReply !== undefined) {
          setLinkToReplyId(linkToReply);
          console.log("work")
        }
        console.log("linkToReplyId",linkToReplyId)
          console.log("replyLinks", replyLink)
  
          const { data: conversationLink } = await deep.select({
            tree_id: { _eq: messagingTreeId },
            parent: { type_id: { _in: [conversationTypeLinkId, messageTypeLinkId] } },
            link: { id: { _eq: replyLink[0].from_id } },
          }, {
            table: 'tree',
            variables: { order_by: { depth: "asc" } },
            returning: `
              id
              depth
              root_id
              parent_id
              link_id
              parent {
                id
                from_id
                type_id
                to_id
                value
                author: out (where: { type_id: { _eq: ${authorTypeLinkId}} }) { 
                  id
                  from_id
                  type_id
                  to_id
                }
                tokens: out (where: { type_id: { _eq: ${tokensTypeLinkId}} }) { 
                  id
                  from_id
                  type_id
                  to_id
                  value
                }
              }`
          })
          console.log("conversationLink",conversationLink)
  
          console.log("trascribedTextLinkId", "who are you")
  
          const { data: [{ id: messageLinkId }] } = await deep.insert({
            type_id: messageTypeLinkId,
            string: { data: { value: "who are you" } },
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              }
            },
          });
  
          const { data: [{ id: replyToMessageLinkId }] } = await deep.insert({
            type_id: replyTypeLinkId,
            from_id: messageLinkId,
            to_id: linkToReply,
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              },
            },
          });
          replyMessageLinkId = replyToMessageLinkId;
          console.log("replyMessageLinkId",replyMessageLinkId)
        }
      }

        console.log("flakeed8");
        setSounds([]);
        setIsRecording(false);
      } catch (error) {
        console.log('Error stopping recording:', error);
      }
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const doAsyncStuff = async () => {
      if (Date.now() - lastPress >= 15000 && !isRecording) {
        const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
        const conversationTypeLinkId = await deep.id("@deep-foundation/chatgpt", "Conversation");

        const { data: [{ id: conversationLinkId }] } =await deep.insert({
          type_id: conversationTypeLinkId,
          string: { data: { value: "New chat" } },
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: deep.linkId,
            },
          },
        });
        setNewConversationLinkId (conversationLinkId)
        console.log("flakeed7");
        setIsTimeEnded(true)
      }
    };
      doAsyncStuff();
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [lastPress, isRecording]);

  const ScreenChat = ({ linkToReply }) => {
    const [messages, setMessages] = useState<Array<any>>([]);
    const [messagesCount, setMessagesCount] = useState(0);
    let chatGptLinkId;
    async () => { chatGptLinkId = await deep.id('@deep-foundation/chatgpt', 'ChatGPT') }

    useEffect(() => {
      const fetchMessages = async () => {
        console.log(" chat newConversationLinkId",newConversationLinkId)
        const messagingTreeId = await deep.id("@deep-foundation/messaging", "MessagingTree");
        const messageTypeLinkId = await deep.id("@deep-foundation/messaging", "Message");
        const authorTypeLinkId = await deep.id("@deep-foundation/messaging", "Author");
        const tokensTypeLinkId = await deep.id("@deep-foundation/tokens", "Tokens")
        console.log("linkToReply",linkToReply)
        const result = await deep.select({ 
          tree_id: { _eq: messagingTreeId },
          link: { type_id: { _eq: messageTypeLinkId} },
          root_id: { _eq: newConversationLinkId },
          // @ts-ignore
          self: {_eq: true}
        }, { 
          table: 'tree',
          variables: { order_by: { depth: "asc" } },
          returning: `
            id
            depth
            root_id
            parent_id
            link_id
            link {
              id
              from_id
              type_id
              to_id
              value
              author: out (where: { type_id: { _eq: ${authorTypeLinkId}} }) { 
                id
                from_id
                type_id
                to_id
              }
            }`
        });

        setMessages(result?.data);
        setMessagesCount(result?.data.length);
      };

      fetchMessages();

      const intervalId = setInterval(fetchMessages, 5000);

      return () => clearInterval(intervalId);
    }, []);

    return (
      <Box
        position="fixed"
        bottom={0}
        left={0}
        zIndex={1000}
        overflowY="scroll"
        height='500px'
        width='500px'
        bg={"grey"}
        p={3}
        borderRadius="20px"
      >
        <Box position="absolute" right={3} top={3}>
      <Button onClick={handleCloseChat}>X</Button>
        </Box>
        {messagesCount ?
          [
            <Text key="header" fontWeight="bold" fontSize="lg">Conversation with {messagesCount} messages:</Text>,
            ...messages.map((message, index) => (
              <Box key={index} mb={3} p={2} borderRadius="5px" bg={message?.link?.author?.[0]?.to_id === chatGptLinkId ? "blue.100" : "green.100"}>
                <Text borderBottom="1px solid" pb={2}>
                  {index === 0 ? "System" : message?.link?.author?.[0]?.to_id === chatGptLinkId ? "You" : "Online consultant"}:
                </Text>
                <Text>{message?.link?.value?.value}</Text>
              </Box>
            ))
          ] : []
        }
      </Box>
    );
  }

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const ChatBubblesContainer = ({ children }) => {
    const containerStyle: CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    };

    return <div style={containerStyle}>{children}</div>;
  };

  const generateRandomChatBubbles = (count) => {
    const messages = [
      "Hello!",
      "How are you?",
      "What are you doing?",
      "Nice to meet you!",
      "Have a good day!",
    ];

    const sides = ["left", "right"];

    const bubbles = Array.from({ length: count }, (_, i) => (
      <ChatBubble
        key={i}
        text={getRandom(messages)}
        side={getRandom(sides)}
        top={Math.floor(Math.random() * (window.innerHeight - 150))}
        left={Math.floor(Math.random() * (window.innerWidth - 150))}
      />
    ));
    return bubbles;
  };

  const handleCloseChat = async () => {
    const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
    const conversationTypeLinkId = await deep.id("@deep-foundation/chatgpt", "Conversation");

    const { data: [{ id: conversationLinkId }] } =await deep.insert({
      type_id: conversationTypeLinkId,
      string: { data: { value: "New chat" } },
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      },
    });
    setNewConversationLinkId (conversationLinkId)
    console.log("flakeed7");
    setIsChatClosed(true);
  };

  return (
    <Stack alignItems={'center'}>
      <NavBar />
      <Heading as={'h1'}>Tai</Heading>

      <Button
        style={{
          position: 'absolute',
          zIndex: 1000,
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '24px',
          top: window.innerHeight / 2,
        }}
        onClick={handleClick}
      >
        {isRecording ? 'STOP RECORDING' : 'START RECORDING'}
      </Button>
      <ScreenChat linkToReply={linkToReply} />
      <ChatBubblesContainer>{generateRandomChatBubbles(10)}</ChatBubblesContainer>
    </Stack>
  );
}

export default function IndexPage() {
  return <Page>
    <Content />
  </Page>
}

function Pages() {
  return <Stack>
    {/* <Link as={NextLink} href="/audiorecord">
      Audiorecord
    </Link> */}

  </Stack>
}
