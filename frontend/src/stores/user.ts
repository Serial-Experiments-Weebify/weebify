import { defineStore } from 'pinia';
import { useQuery } from '@vue/apollo-composable';
import { gql } from '@/_gql';

export const useUserStore = defineStore('notifications', () => {
    const me = useQuery(
        gql(`
            query Me {
                me {
                    id
                    username
                    displayName
                    pfp
                    bio
                    role
                    email
                    invitedBy
                }
            }
        `)
    );

    return { me };
});
