import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Title, List, FAB, Dialog, Button, TextInput, Text } from 'react-native-paper';
import { auth, db } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function HomeScreen({ navigation }: any) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [visible, setVisible] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // For simplicity, listing all rooms. In a real app, query rooms where user is participant.
        const q = query(collection(db, 'rooms'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, querySnapshot => {
            setRooms(
                querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name,
                    ...doc.data()
                }))
            );
        });
        return unsubscribe;
    }, []);

    const handleLogout = () => {
        signOut(auth);
    };

    const createRoom = async () => {
        if (!newRoomName) return;
        setLoading(true);
        try {
            await addDoc(collection(db, 'rooms'), {
                name: newRoomName,
                createdAt: new Date(),
                createdBy: auth.currentUser?.uid,
            });
            setVisible(false);
            setNewRoomName('');
        } catch (e) {
            Alert.alert('Error', 'Could not create room');
        } finally {
            setLoading(false);
        }
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button onPress={handleLogout}>Logout</Button>
            ),
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <FlatList
                data={rooms}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.name}
                        description="Tap to join chat"
                        left={props => <List.Icon {...props} icon="chat" />}
                        onPress={() => navigation.navigate('Chat', { roomId: item.id, roomName: item.name })}
                    />
                )}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No chats yet. Create one!</Text>}
            />
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => setVisible(true)}
            />
            <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                <Dialog.Title>New Chat Room</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        label="Room Name"
                        value={newRoomName}
                        onChangeText={setNewRoomName}
                        autoFocus
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => setVisible(false)}>Cancel</Button>
                    <Button onPress={createRoom} loading={loading}>Create</Button>
                </Dialog.Actions>
            </Dialog>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
