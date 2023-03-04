<script lang="ts" setup>
import { type Ref, ref } from 'vue';

type InputType = 'password' | 'text' | 'email';
const props = withDefaults(
    defineProps<{
        type: InputType;
        value: string;
        name: string;
        label: string;
        required?: boolean;
        autocomplete?: string;
        error?: string;
    }>(),
    {
        type: 'text',
    }
);

const dirty = ref(false);

const emit = defineEmits<{
    (e: 'update:value', v: string): void;
}>();
</script>

<template>
    <div class="text-input" :class="{ 'external-error': !!props.error }">
        <label :for="`textin-${props.name}`"
            >{{ props.error ?? props.label }}
            <span class="required" v-if="props.required">*</span>
        </label>
        <input
            :type="props.type"
            :name="props.name"
            :id="`textin-${props.name}`"
            :autocomplete="props.autocomplete"
            :required="props.required"
            :value="value"
            :class="{ dirty }"
            @input="
                emit('update:value', ($event.target as HTMLInputElement).value)
            "
            @focus="dirty = true"
        />
    </div>
</template>

<style scoped lang="less">
.text-input {
    margin-bottom: 10px;

    &.external-error {
        label {
            color: @c-mandy;
            font-size: 12px;
        }
        input {
            border: 2px @c-mandy solid !important;
        }
    }

    label {
        display: block;
        font-size: 18px;
        line-height: 22px;
        font-weight: 500;

        .required {
            color: @c-mandy;
        }
    }

    &:focus-within {
        label {
            color: @c-cyan;
        }
    }
    input {
        margin: 8px 0;
        background-color: darken(@c-mirage, 6%);
        border: none;
        outline: none;
        font-size: 22px;
        padding: 8px;
        border-radius: 8px;
        color: @c-snow;
        border: 2px @c-oil solid;
        transition: border @t-subtle ease;

        &.dirty:invalid:not(:focus) {
            border: 2px @c-mandy solid !important;
        }

        &:focus {
            border: 2px @c-cyan solid;
        }
    }
    &:hover:not(:focus-within) input {
        border: 2px darken(@c-cyan, 10%) solid;
    }
}
</style>
