<script lang="ts">
    import { Button } from '$lib/shadcn/components/ui/button';
    import * as Dialog from '$lib/shadcn/components/ui/dialog';

    let open = false;

    let res: ((confirmed: boolean) => void) | undefined;

    export const confirm = async () => {
        // if already open, close previous prompt
        if (open && res) res(false);

        open = true;
        const confirmed = await new Promise<boolean>((resolve) => {
            res = resolve;
        });
        res = undefined;
        open = false;
        return confirmed;
    };

    const cancelClicked = () => {
        if (!open || !res) return;
        res(false);
    };

    const confirmClicked = () => {
        if (!open || !res) return;
        res(true);
    };
</script>

<Dialog.Root bind:open closeOnOutsideClick={false} onOpenChange={cancelClicked}>
    <Dialog.Portal>
        <Dialog.Content>
            <Dialog.Header>
                <slot />
            </Dialog.Header>
            <Dialog.Footer>
                <div class="flex w-full justify-between">
                    <Button type="submit" on:click={cancelClicked}>Cancel</Button>
                    <Button type="submit" variant="destructive" on:click={confirmClicked}>
                        Confirm
                    </Button>
                </div>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
