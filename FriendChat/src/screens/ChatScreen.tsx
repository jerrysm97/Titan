import React, { useState, useLayoutEffect, useCallback } from 'react';
import { View, Platform, KeyboardAvoidingView, StyleSheet, SafeAreaView } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { collection, addDoc, orderBy, query, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { FlashList } from "@shopify/flash-list";

export default function ChatScreen() {
    const [messages, setMessages] = useState<IMessage[]>([]);

    // 1. Listen for updates in real-time
    useLayoutEffect(() => {
        const collectionRef = collection(db, 'chats');
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

        return unsubscribe; // Detach listener when leaving screen
    }, []);

    // 2. Send Message Function
    const onSend = useCallback((messages: IMessage[] = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages)
        );

        const { _id, createdAt, text, user } = messages[0];

        addDoc(collection(db, 'chats'), {
            _id,
            createdAt,
            text,
            user,
        });
    }, []);

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
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Adjust based on your header height
                style={{ flex: 1 }}
            >
                <GiftedChat
                    messages={messages}
                    onSend={messages => onSend(messages)}
                    user={{
                        _id: auth?.currentUser?.email || 'guest', // Uses logged in email as ID or guest
                        name: auth?.currentUser?.displayName || 'Guest',
                        avatar: 'https://i.pravatar.cc/300', // Random avatar for fun
                    }}
                    renderListView={renderListView}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})
