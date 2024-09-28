<script lang="ts">
    import * as Drawer from "$lib/shadcn/components/ui/drawer";
    import { Button } from "$lib/shadcn/components/ui/button";

    export let title: string = 'Share';
    export let url: string;
    console.log(url); // just so it's not unused
</script>

<div class="mx-auto w-full max-w-sm">
    <Drawer.Header>
        <Drawer.Title>{title}</Drawer.Title>
    </Drawer.Header>
    <div class="p-4 pb-0">
        Not yet implemented!
    </div>
    <Drawer.Footer>
        <Drawer.Close asChild let:builder>
            <Button builders={[builder]} variant="outline">Close</Button>
        </Drawer.Close>
    </Drawer.Footer>
</div>
