import { ref } from 'vue';
import { defineStore } from 'pinia';
// import { ApolloError } from '@apollo/client';

type Level = 'info' | 'warn' | 'error' | 'success';

interface INotification {
    id: number;
    type: Level;
    time: number;
    message: string;
}

const TYPE2TIME: Record<Level, number> = {
    success: 3000,
    info: 3000,
    warn: 5000,
    error: 10000,
};

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref<INotification[]>([]);
    let id = 0;

    function addNotification(type: Level, message: string, time?: number) {
        id++;
        if (!time) time = TYPE2TIME[type];
        notifications.value.push({ id, type, message, time });
    }

    function errorNotification(error: unknown) {
        if (typeof error === 'string') {
            return addNotification('error', error);
        }

        // if (error instanceof ApolloError) {
        //     addNotification('error', error.message);
        // }

        console.error(error);

        if (error instanceof Error) {
            return addNotification('error', error.message);
        }

        addNotification('error', error?.toString?.() ?? 'An unknown error occurred');
    }

    function removeNotification(id: number) {
        const index = notifications.value.findIndex((x) => x.id == id);
        if (index != -1) {
            notifications.value.splice(index, 1);
        }
    }

    return { notifications, addNotification, removeNotification, errorNotification };
});
