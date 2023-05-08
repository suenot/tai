import React, { useEffect, useState, useCallback,CSSProperties } from 'react';
import { LocalStoreProvider, useLocalStore } from '@deep-foundation/store/local';
import {

  Text,
  Link,
  Stack,
  Card,
  CardBody,
  Heading,
  CardHeader,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Switch,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
} from '@chakra-ui/react';
import {

  useDeep,
  useDeepSubscription,
} from '@deep-foundation/deeplinks/imports/client';
import { DEEP_MEMO_PACKAGE_NAME as DEEP_MEMO_PACKAGE_NAME } from '../imports/deep-memo/package-name';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import { WithSubscriptions } from '../components/deep-memo/with-subscriptions';
import { useIsPackageInstalled } from '../imports/use-is-package-installed';
import { WithInitDeviceIfNotInitedAndSaveData } from '../components/device/withInitDeviceIfNotInitedAndSaveData';
import { NavBar } from '../components/navbar';
import { Page } from '../components/page';

import startAudioRec from '../imports/capacitor-voice-recorder/strart-recording';
import stopAudioRec from '../imports/capacitor-voice-recorder/stop-recording';
import getAudioRecPermission from '../imports/capacitor-voice-recorder/get-permission';
import installPackage from '../imports/capacitor-voice-recorder/install-package';
import ChatBubble from '../components/ChatBubble';
const delay = (time) => new Promise(res => setTimeout(() => res(null), time));

function Content() {
  useEffect(() => {
    defineCustomElements(window);
  }, []);

  const deep = useDeep();
  const [sounds, setSounds] = useLocalStore("Sounds", []);
  const [isRecording, setIsRecording] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [googleAuth, setGoogleAuth] = useState('');
  const [showInputFields, setShowInputFields] = useState(false);

  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );

  useEffect(() => {
    new Promise(async () => {
      if (deep.linkId !== 0) {
        return;
      }
      await deep.guest();
    })
  }, [deep])

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

  useEffect(() => {
    if (!isRecording) return;

    const useRecords = async () => {
    const PACKAGE_NAME="@deep-foundation/capacitor-voice-recorder";
     const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
     const audioRecordsLinkId = await deep.id(PACKAGE_NAME, "AudioRecords");
     const soundTypeLinkId = await deep.id("@deep-foundation/sound", "Sound");
     const recordTypeLinkId = await deep.id(PACKAGE_NAME, "Record");
     const durationTypeLinkId = await deep.id(PACKAGE_NAME, "Duration");
     const startTimeTypeLinkId = await deep.id(PACKAGE_NAME, "StartTime");
     const endTimeTypeLinkId = await deep.id(PACKAGE_NAME, "EndTime");
     const mimetypeTypeLinkId = await deep.id("@deep-foundation/sound", "MIME/type");
     const formatTypeLinkId = await deep.id("@deep-foundation/sound", "Format");
     const transcribeTypeLinkId = await deep.id("@deep-foundation/google-speech", "Transcribe");
     const typeTypeLinkId = await deep.id('@deep-foundation/core', "Type");
     const gcloudAuthKeyTypeLink = await deep.id("@deep-foundation/google-speech", "GoogleCloudAuthFile");
     const typeStringLinkId = await deep.id('@deep-foundation/core', "String");
     const typeValueLinkId = await deep.id('@deep-foundation/core', "Value");
     const messageTypeLinkId = await deep.id('@deep-foundation/messaging', 'Message');
  	 const replyTypeLinkId = await deep.id('@deep-foundation/messaging', 'Reply');
      const transcriptionTypeLinkId = await deep.id("@deep-foundation/google-speech", "Transcription");
      const apiKeyTypeLinkId=await deep.id("@deep-foundation/openai", "ApiKey");
      const conversationTypeLinkId=await deep.id("@deep-foundation/chatgpt", "Conversation");
     const userLink = await deep.id('deep', 'admin');
     console.log("sounds",sounds);
     console.log("flakeed2");
const { data: [{ id: soundLinkId }] }  = await deep.insert(sounds.map((sound) => ({
          type_id: recordTypeLinkId,
          in: {
             data: [{
               type_id: containTypeLinkId,
               from_id: audioRecordsLinkId,
             }]
           },
           out: {
             data: [
               {
                 type_id: containTypeLinkId,
                 to: {
                   data: {
                     type_id: soundTypeLinkId,
                     string: { data: { value:  sound.record["recordDataBase64"]  } },
                     out: {
                       data: [
                         {
                           type_id: containTypeLinkId,
                           to: {
                             data: {
                               type_id: mimetypeTypeLinkId,
                               string: { data: { value:  sound.record["mimeType"]   } },
                             }
                           }
                        },
                        {
                          type_id: containTypeLinkId,
                          to: {
                            data: {
                              type_id: formatTypeLinkId,
                              string: { data: { value: sound.record["mimeType"] === "audio/webm;codecs=opus" ? "webm" : "aac" } },
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              },
              {
                type_id: containTypeLinkId,
                to: {
                  data: {
                    type_id: durationTypeLinkId,
                    number: { data: { value: sound.record["msDuration"] } },
                  }
                }
              },
              {
                type_id: containTypeLinkId,
                to: {
                  data: {
                    type_id: startTimeTypeLinkId,
                    string: { data: { value: sound.startTime } },
                  }
                }
              },
              {
                type_id: containTypeLinkId,
                to: {
                  data: {
                    type_id: endTimeTypeLinkId,
                    string: { data: { value: sound.endTime } },
                  }
                }
              }]
          }
        })));
        console.log("flakeed1");


     const { data: [isGcloudAuthKeyLinkId ] } = await deep.select({
      type_id:gcloudAuthKeyTypeLink,
      in: {
        type_id: containTypeLinkId,
        from_id: deep.linkId,
      },
     });
     console.log("googleauth",googleAuth);
     if(!isGcloudAuthKeyLinkId){
      const parsedGoogleAuth = JSON.parse(googleAuth);
    await deep.insert({
      type_id: gcloudAuthKeyTypeLink,
      object: { data: { value: parsedGoogleAuth } },
      in: {
        data: [
          {
            type_id: containTypeLinkId,
            from_id: deep.linkId,
          }
        ]
      }
  })}
  console.log("flakeed3");
        const { data: [{ id: transcribedTextLinkId }] } = await deep.insert( {
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
    console.log("flakeed4");
    console.log("text",transcribedTextLinkId);


const { data: [isApiKeyLinkId ] } = await deep.select({
  type_id:apiKeyTypeLinkId,
  in: {
    type_id: containTypeLinkId,
    from_id: deep.linkId,
  },
 });
 console.log("flakeed5");
   if(!isApiKeyLinkId){
     await deep.insert({
      type_id:  apiKeyTypeLinkId,
      string: { data: { value: apiKey }},
      in: {
        data: [
          {
            type_id: await deep.id('@deep-foundation/core', "Contain"),
            from_id: deep.linkId,
          }]
      }});
    }

    
console.log("flakeed6");
const { data: [isConversationLinkId ] } = await deep.select({
  type_id:conversationTypeLinkId,
  in: {
    type_id: containTypeLinkId,
    from_id: deep.linkId,
  },
 });
      if (!isConversationLinkId) {
          const { data: [{id: conversationLinkId}]}= await deep.insert({
          type_id: conversationTypeLinkId,
          string: { data: { value: "New chat" } },
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: deep.linkId,
            },
          },
        });
      };
    console.log("flakeed7");

    const { data: [ConversationLinkId ] } = await deep.select({
      type_id:conversationTypeLinkId,
      in: {
        type_id: containTypeLinkId,
        from_id: deep.linkId,
      },
     });
const { data: [{ id: messageLinkId }] } = await deep.insert({
  type_id: messageTypeLinkId,
  string: { data: { value: "hello" } },
  in: {
    data: {
      type_id: containTypeLinkId,
      from_id: deep.linkId,
    }
  },
});


  console.log("flakeed8");
    const {
      data: [{ id: replyToMessageLinkId }],
    } = await deep.insert({
      type_id: replyTypeLinkId,
      from_id: messageLinkId,
      to_id: ConversationLinkId.id,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      },
    });

      setSounds([]);
    };

    if (sounds.length > 0) useRecords();
  }, [sounds, isRecording]);
  console.log("flakeed9");
  useEffect(() => {
    if (!isRecording) return;

    let loop = true;
    const startRecordingCycle = async (duration) => {
      for (; isRecording && loop;) {
        await startAudioRec(deep);
        const startTime = new Date().toLocaleDateString();
        await delay(duration);
        const record = await stopAudioRec(deep);
        const endTime = new Date().toLocaleDateString();
        console.log({ record });
        setSounds([...sounds, { record, startTime, endTime }]);
      }
    };

    startRecordingCycle(5000);
    return function stopCycle() {
      loop = false;
    };
  }, [isRecording]);
  console.log("flakeed10");
  const handleInputChange = useCallback((e, field) => {
    const value = e.target.value;
  
    if (field === 'apiKey') {
      setApiKey(value);
    } else if (field === 'googleAuth') {
      try {
        setGoogleAuth(value);
      } catch (error) {
        console.error('Invalid JSON:', error);
      }
    }
  }, []);

  const handleButtonClick = useCallback(() => {
    if (!showInputFields && (apiKey === '' || googleAuth === '')) {
      setShowInputFields(true);
    } else {
      if (apiKey === '' || googleAuth === '') {
        alert('Please fill both input fields before starting the recording.');
        return;
      }
      setIsRecording((prevIsRecording) => !prevIsRecording);
      if (apiKey !== '' && googleAuth !== '') {
        setShowInputFields(false);
      }
    }
  }, [apiKey, googleAuth, showInputFields]);

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

  return (
    <Stack alignItems={'center'}>
      <NavBar />
      <Heading as={'h1'}>Tai</Heading>
      {generalInfoCard}
      {
          <>
            <WithInitDeviceIfNotInitedAndSaveData deep={deep} deviceLinkId={deviceLinkId} setDeviceLinkId={setDeviceLinkId} />
            {
              Boolean(deviceLinkId) ? (
                <>
                  <Pages />
                </>
              ) : (
                <Text>Initializing the device...</Text>
              )
            }
          </>
       
      }
      {/* <Button style={{ position: 'relative', zIndex: 1000 }} onClick={async () => await installPackage(deviceLinkId)}>
      INSTALL PACKAGE
    </Button> */}
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
    top:window.innerHeight/2,
  }}
  onClick={handleButtonClick}
>
        {isRecording ? 'STOP RECORDING' : 'START RECORDING'}
      </Button>
      {showInputFields && (
        <Box
          position="absolute"
          top="20%"
          left="20%"
          transform="translate(-50%, -50%)"
          zIndex={1001}
        >
          <FormControl>
            <FormLabel>Input OpenAI ApiKey:</FormLabel>
            <Input
              value={apiKey}
              onChange={(e) => handleInputChange(e, 'apiKey')}
              width="300px" 
              height="40px" 
            />
          </FormControl>
          <FormControl>
            <FormLabel>Input GoogleAuth object:</FormLabel>
            <Input
              value={googleAuth}
              onChange={(e) => handleInputChange(e, 'googleAuth')}
              width="300px" 
              height="40px" 
            />
          </FormControl>
        </Box>
      )}
        <Button style={{ position: 'relative', zIndex: 1000 }} onClick={async () => await getAudioRecPermission(deep, deviceLinkId)}>
      GET RECORDING PERMISSION
    </Button>
    {sounds?.map((r) => <audio key={r.id} controls src={`data:${r.mimetype};base64,${r.sound}`} />)}
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