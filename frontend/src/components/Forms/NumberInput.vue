<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps<{
    value: number;
    name: string;
    label: string;
    required?: boolean;
    min: number;
    max: number;
    step: number;
    error?: string;
}>();

const dirty = ref(false);

const emit = defineEmits<{
    (e: 'update:value', v: number): void;
}>();
</script>

<template>
    <div class="number-input" :class="{ 'external-error': !!props.error }">
        <label :for="`numberin-${props.name}`"
            >{{ props.error ?? props.label }}
            <span v-if="props.required" class="required">*</span>
        </label>
        <input
            :id="`numberin-${props.name}`"
            type="number"
            :name="props.name"
            :required="props.required"
            :value="props.value"
            :min="props.min"
            :step="props.step"
            :max="props.max"
            :class="{ dirty }"
            @input="
                emit(
                    'update:value',
                    ($event.target as HTMLInputElement).valueAsNumber
                )
            "
            @focus="dirty = true"
        />
    </div>
</template>

<style scoped lang="less">
.number-input {
    margin-bottom: 10px;

    input[type='number']::-webkit-inner-spin-button,
    input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type='number'] {
        -moz-appearance: textfield;
        appearance: textfield;
        margin: 0;
    }

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
