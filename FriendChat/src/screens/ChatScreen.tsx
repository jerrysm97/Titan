import React, { useState, useLayoutEffect, useCallback } from 'react';
import { View, Platform, KeyboardAvoidingView, StyleSheet, SafeAreaView } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { collection, addDoc, orderBy, query, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { FlashList } from "@shopify/flash-list";

export default function ChatScreen({ route, navigation }: any) {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const { roomId, roomName } = route.params;

    useLayoutEffect(() => {
        navigation.setOptions({ title: roomName || 'Chat' });

        // Listen to specific room messages
        const collectionRef = collection(db, 'rooms', roomId, 'messages');
        const q = query(collectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, querySnapshot => {
            setMessages(
                querySnapshot.docs.map(doc => ({
                    _id: doc.id,
                    createdAt: doc.data().createdAt.toDate(),
                    text: doc.data().text,
                    user: doc.data().user,
                }))
            );
        });

        return unsubscribe;
    }, [roomId, roomName, navigation]);

    const onSend = useCallback((messages: IMessage[] = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages)
        );

        const { _id, createdAt, text, user } = messages[0];

        // Add to specific room
        addDoc(collection(db, 'rooms', roomId, 'messages'), {
            _id,
            createdAt,
            text,
            user: {
                _id: auth?.currentUser?.uid,
                name: auth?.currentUser?.email,
                avatar: 'https://i.pravatar.cc/300',
            }, // Use real auth user
        });
    }, [roomId]);

    const renderListView = (props: any) => {
        return (
            <FlashList
                {...props}
                estimatedItemSize={100}
            />
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
                style={{ flex: 1 }}
            >
                <GiftedChat
                    messages={messages}
                    onSend={messages => onSend(messages)}
                    user={{
                        _id: auth?.currentUser?.uid || 'guest',
                    }}
                    renderListView={renderListView}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
