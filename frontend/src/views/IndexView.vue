<script setup lang="ts">
import UserTestimonial from '@/components/Content/UserTestimonial.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
</script>

<template>
    <main>
        <div id="hero">
            <h1>
                Yet another
                <span class="hl">anime</span>
                streaming website
            </h1>
            <div v-if="auth.loggedIn" class="buttons">
                <RouterLink to="/home" class="w-big-button">Home</RouterLink>
            </div>
            <div v-else class="buttons">
                <RouterLink to="/login" class="w-big-button">Log in</RouterLink>
                <RouterLink to="/signup" class="w-big-button"
                    >Sign up</RouterLink
                >
            </div>
        </div>
        <div class="testimonials sane-width">
            <h1 id="testimonials">User Testimonials</h1>
            <UserTestimonial
                name="Martin (real person)"
                pfp-side="left"
                image="/misc/martin.webp"
            >
                😹 systemd
            </UserTestimonial>

            <UserTestimonial
                name="Matic?"
                pfp-side="right"
                image="/misc/asuka.png"
            >
                Kubernetes was invented by big YAML to sell more YAML.
            </UserTestimonial>

            <UserTestimonial
                name="Bane"
                pfp-side="left"
                image="/misc/bane.webp"
            >
                Perhaps he is wondering why someone would shoot a man before
                throwing him out of a plane.
            </UserTestimonial>
        </div>
    </main>
</template>

<style scoped lang="less">
@keyframes slideGradient {
    from {
        background-position: 0% center;
    }
    to {
        background-position: 500% center;
    }
}

main {
    background-image: linear-gradient(fade(@c-mirage, 75%), fade(@c-oil, 100%)),
        url('@/assets/images/wallpaper.jpg');
    background-position: center;
    background-size: cover;
    display: flex;
    flex-direction: column;
    align-items: center;

    #hero {
        height: 60vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        h1 {
            font-size: clamp(36px, 7vw, 120px);
            max-width: 1600px;
            font-weight: 400;
            text-align: center;
            margin: 32px 0;
            filter: drop-shadow(0 0 10px @c-mirage)
                drop-shadow(0 0 20px @c-mirage) drop-shadow(0 0 30px @c-mirage);

            .hl {
                font-weight: 600;
                background: radial-gradient(
                    in oklch circle,
                    @c-cyan,
                    @c-mandy,
                    @c-cyan
                );
                background-clip: text;
                color: transparent;
                background-size: 500% auto;
                animation: slideGradient 12s linear infinite;
            }
        }

        .buttons {
            a:not(:last-child) {
                margin-right: 10px;
            }
        }
    }

    .testimonials {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        min-width: 50%;
        margin: 10px;

        #testimonials {
            font-size: 48px;
            font-weight: 600;
            text-align: center;
        }

        .testimonial {
            margin-bottom: 40px;
        }
    }
}
</style>
