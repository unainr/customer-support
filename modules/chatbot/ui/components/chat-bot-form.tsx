"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ImageUpload } from "@/lib/image-upload";
import { Spinner } from "@/components/ui/spinner";
import {
	ArrowRight,
	Check,
	CheckCircle,
	Copy,
	Sparkles,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Progress } from "@/components/ui/progress";
import { formSchema } from "../../server/schema";
import { useRouter } from "next/navigation";
import { useCreateChatbot } from "../../hooks/use-create-bot";

export function ChatBotForm() {
	const [imageUploading, setImageUploading] = useState(false);
	const [copied, setCopied] = useState(false);
	const { mutateAsync, isPending } = useCreateChatbot();
	const router = useRouter()
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			botname: "",
			botAvatarUrl: "",
			primaryColor: "",
		},
	});

	const handleCopy = async () => {
		await navigator.clipboard.writeText(form.getValues("primaryColor"));
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};
	// Image upload
	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setImageUploading(true);
		try {
			const url = await ImageUpload(file);
			if (url) {
				form.setValue("botAvatarUrl", url);
				toast.success("Image uploaded");
			} else {
				toast.error("Failed to upload image");
			}
		} catch {
			toast.error("Error uploading image");
		} finally {
			setImageUploading(false);
		}
	};

	async function onSubmit(data: z.infer<typeof formSchema>) {
		const bot = await mutateAsync(data);
		router.push(`/workspace/${bot?.id}`)
	}

	return (
		<>
		<Card className="w-full sm:max-w-md">
			<CardHeader>
				<CardTitle>Profile Settings</CardTitle>
				<CardDescription>
					Update your profile information below.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form id="form-rhf-input" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Controller
							name="botname"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="form-rhf-input-username">
										Bot Name
									</FieldLabel>
									<Input
										{...field}
										id="form-rhf-input-username"
										aria-invalid={fieldState.invalid}
										placeholder="shadcn"
										autoComplete="username"
									/>

									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
						{/* bot avatar url */}
						<div className="space-y-2">
							<label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
								Bot Avatar
							</label>
							<label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all group">
								<div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center shrink-0">
									{imageUploading ? (
										<Spinner />
									) : (
										<HugeiconsIcon
											icon={ArrowRight}
											size={14}
											strokeWidth={2}
											className="text-zinc-400 group-hover:text-indigo-500 transition-colors"
										/>
									)}
								</div>
								<div>
									<p className="text-sm text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
										{imageUploading ? "Uploading…" : "Click to upload Image"}
									</p>
									<p className="text-xs text-zinc-400">
										PNG, JPG, WEBP up to 5MB
									</p>
								</div>
								<Input
									type="file"
									accept="image/*"
									onChange={handleImageUpload}
									disabled={imageUploading}
									className="hidden"
								/>
							</label>
							<Controller
								name="botAvatarUrl"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<Input {...field} type="hidden" />
										{field.value && (
											<div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
												<HugeiconsIcon
													icon={CheckCircle}
													strokeWidth={2}
													size={12}
												/>
												<span>Banner uploaded</span>
												<Progress value={100} className="flex-1 h-1" />
											</div>
										)}
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</div>
						{/* preview url */}
						<div className="p-4">
							{form.watch("botAvatarUrl") ? (
								<Image
									src={form.watch("botAvatarUrl")}
									width={900}
									height={900}
									alt="Banner"
									className="w-full rounded-xl border border-zinc-100 dark:border-zinc-800 object-cover"
								/>
							) : (
								<div className="aspect-video rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-2">
									<div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
										<HugeiconsIcon
											icon={ArrowRight}
											strokeWidth={2}
											className="h-5 w-5 text-zinc-300 dark:text-zinc-500"
										/>
									</div>
									<p className="text-xs text-zinc-400">
										No banner uploaded yet
									</p>
								</div>
							)}
						</div>
					</FieldGroup>
					{/* primary color */}
					<Controller
						name="primaryColor"
						control={form.control}
						render={({ field }) => (
							<div className="space-y-3">
								<FieldLabel>Bot Color</FieldLabel>

								<HexColorPicker color={field.value} onChange={field.onChange} />

								{/* Input + Copy (FIXED ROW) */}
								<div className="flex items-center gap-1">
									<Input
										value={field.value}
										onChange={field.onChange}
										className="max-w-20 text-center p-0 border rounded-md cursor-pointer"
									/>

									<Button
										type="button"
										size="icon"
										variant="outline"
										className="h-9 w-9 shrink-0"
										onClick={handleCopy}>
										{copied ? (
											<HugeiconsIcon
												icon={CheckCircle}
												strokeWidth={2}
												className="w-4 h-4 text-green-500"
											/>
										) : (
											<HugeiconsIcon icon={Copy} className="w-4 h-4" />
										)}
									</Button>
								</div>
							</div>
						)}
					/>
				</form>
			</CardContent>
			<CardFooter>
				<Field orientation="horizontal">
					<Button type="button" variant="outline" onClick={() => form.reset()}>
						Reset
					</Button>
					<Button
						disabled={imageUploading || isPending}
						type="submit"
						form="form-rhf-input">
						{isPending ? (
							<>
								<Spinner /> Saving...
							</>
						) : (
							<>
								<HugeiconsIcon icon={Sparkles} strokeWidth={2} size={15} /> Save
								Bot
							</>
						)}
					</Button>
				</Field>
			</CardFooter>
		</Card>
		</>
	);
}
