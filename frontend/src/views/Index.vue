<script setup lang="ts">
import Testimonial from '@/components/Content/Testimonial.vue';
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
            <div class="buttons" v-if="auth.loggedIn">
                <RouterLink to="/home" class="w-big-button">Home</RouterLink>
            </div>
            <div class="buttons" v-else>
                <RouterLink to="/login" class="w-big-button">Log in</RouterLink>
                <RouterLink to="/signup" class="w-big-button"
                    >Sign up</RouterLink
                >
            </div>
        </div>
        <div class="testimonials sane-width">
            <h1 id="testimonials">User Testimonials</h1>
            <Testimonial
                name="Martin (real person)"
                pfp-side="left"
                image="/misc/martin.webp"
            >
                Weebify is lit, just like Megumin's Explosion spell. Never have
                to worry about buffering or lag again, it's like a KABOOM of
                anime goodness!
            </Testimonial>
            <Testimonial
                name="Teknix"
                pfp-side="right"
                image="/misc/teknix.webp"
            >
                "Great hentai website"
            </Testimonial>
            <Testimonial
                name="Ted Kaczynski"
                pfp-side="left"
                image="/misc/ted.webp"
            >
                The Industrial Revolution and its consequences have been a
                disaster for the human race.
            </Testimonial>
            <Testimonial name="David" pfp-side="right" image="/misc/david.webp">
                Ti si retarded
            </Testimonial>
            <Testimonial
                name="Matic (developer)"
                pfp-side="left"
                image="/misc/asuka.png"
            >
                :painpeko:
            </Testimonial>
        </div>
    </main>
</template>

<style scoped lang="less">
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
            font-weight: 400;
            text-align: center;
            margin: 32px 0;

            .hl {
                color: @c-cyan;
                font-weight: 600;
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
