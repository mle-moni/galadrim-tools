import { makeAutoObservable } from "mobx";

export class ImageInputStore {
    public image: File | null = null;

    public imageSrc: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    setImage(image: File | null) {
        this.image = image;
        if (image) {
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                () => {
                    if (reader.result) {
                        this.setImageSrc(reader.result.toString());
                    }
                },
                false,
            );
            reader.readAsDataURL(image);
        }
    }

    setImageSrc(state: string | null) {
        this.imageSrc = state;
    }

    setUploadedImage(input: HTMLInputElement) {
        const image: File | null = input.files && input.files.length >= 1 ? input.files[0] : null;
        this.setImage(image);
    }
}
