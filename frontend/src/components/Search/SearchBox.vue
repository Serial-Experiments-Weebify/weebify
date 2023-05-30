<script setup lang="ts">
function val(e: EventTarget) {
    return (e as HTMLInputElement).value;
}
</script>

<template>
    <ais-search-box>
        <template v-slot="{ currentRefinement, isSearchStalled, refine }">
            <input
                type="search"
                class="ws-search-box"
                placeholder="Search"
                :value="currentRefinement"
                :class-names="{ 'ais-SearchBox': 'ws-search' }"
                :class="{ loading: isSearchStalled }"
                @input="refine(val($event.currentTarget!))"
            />
        </template>
    </ais-search-box>
</template>

<style lang="less">
.ws-search-box {
    background-color: darken(@c-mirage, 6%);
    border: none;
    outline: none;
    font-size: 22px;
    padding: 8px;
    border-radius: 8px;
    color: @c-snow;
    border: 2px @c-oil solid;
    transition: border @t-subtle ease;
    width: 100%;
    text-align: center;

    &:focus {
        border: 2px @c-cyan solid;
    }
}
</style>
