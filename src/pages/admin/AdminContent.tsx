import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CTAContent {
    id: string;
    headline: string;
    description: string | null;
    button_text: string | null;
    button_url: string | null;
}

interface MissionContent {
    id: string;
    heading: string;
    paragraph: string;
    cta_text: string | null;
    cta_url: string | null;
    image_url: string | null;
}

const AdminContent = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [ctaData, setCTAData] = useState<CTAContent | null>(null);
    const [missionData, setMissionData] = useState<MissionContent | null>(null);

    const [ctaForm, setCTAForm] = useState({
        headline: "",
        description: "",
        button_text: "",
        button_url: "",
    });

    const [missionForm, setMissionForm] = useState({
        heading: "",
        paragraph: "",
        cta_text: "",
        cta_url: "",
        image_url: "",
    });

    const fetchContent = async () => {
        setIsLoading(true);
        try {
            // Fetch CTA content
            const { data: cta, error: ctaError } = await supabase.from("cta_content").select("*").limit(1).maybeSingle();

            if (ctaError) throw ctaError;

            if (cta) {
                setCTAData(cta);
                setCTAForm({
                    headline: cta.headline,
                    description: cta.description || "",
                    button_text: cta.button_text || "",
                    button_url: cta.button_url || "",
                });
            }

            // Fetch Mission content
            const { data: mission, error: missionError } = await supabase.from("mission_content").select("*").limit(1).maybeSingle();

            if (missionError) throw missionError;

            if (mission) {
                setMissionData(mission);
                setMissionForm({
                    heading: mission.heading,
                    paragraph: mission.paragraph,
                    cta_text: mission.cta_text || "",
                    cta_url: mission.cta_url || "",
                    image_url: mission.image_url || "",
                });
            }
        } catch (error: any) {
            console.error("Error fetching content:", error);
            toast.error("Failed to load content");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const saveCTA = async () => {
        setIsSaving(true);
        try {
            if (ctaData) {
                const { error } = await supabase
                    .from("cta_content")
                    .update({
                        headline: ctaForm.headline,
                        description: ctaForm.description || null,
                        button_text: ctaForm.button_text || null,
                        button_url: ctaForm.button_url || null,
                    })
                    .eq("id", ctaData.id);

                if (error) throw error;
            } else {
                const { error } = await supabase.from("cta_content").insert({
                    headline: ctaForm.headline,
                    description: ctaForm.description || null,
                    button_text: ctaForm.button_text || null,
                    button_url: ctaForm.button_url || null,
                });

                if (error) throw error;
            }

            toast.success("CTA content saved successfully");
            fetchContent();
        } catch (error: any) {
            console.error("Error saving CTA:", error);
            toast.error(error.message || "Failed to save CTA content");
        } finally {
            setIsSaving(false);
        }
    };

    const saveMission = async () => {
        if (!missionForm.heading.trim() || !missionForm.paragraph.trim()) {
            toast.error("Heading and paragraph are required");
            return;
        }

        setIsSaving(true);
        try {
            if (missionData) {
                const { error } = await supabase
                    .from("mission_content")
                    .update({
                        heading: missionForm.heading,
                        paragraph: missionForm.paragraph,
                        cta_text: missionForm.cta_text || null,
                        cta_url: missionForm.cta_url || null,
                        image_url: missionForm.image_url || null,
                    })
                    .eq("id", missionData.id);

                if (error) throw error;
            } else {
                const { error } = await supabase.from("mission_content").insert({
                    heading: missionForm.heading,
                    paragraph: missionForm.paragraph,
                    cta_text: missionForm.cta_text || null,
                    cta_url: missionForm.cta_url || null,
                    image_url: missionForm.image_url || null,
                });

                if (error) throw error;
            }

            toast.success("Mission content saved successfully");
            fetchContent();
        } catch (error: any) {
            console.error("Error saving mission:", error);
            toast.error(error.message || "Failed to save mission content");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link to="/admin">
                <Button variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
            </Link>
            <h1 className="font-heading text-3xl font-bold">Content Management</h1>

            <Tabs defaultValue="cta" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="cta">CTA Section</TabsTrigger>
                    <TabsTrigger value="mission">Mission Section</TabsTrigger>
                </TabsList>

                <TabsContent value="cta" className="mt-6">
                    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                        <div>
                            <h2 className="font-heading text-xl font-semibold">Call to Action</h2>
                            <p className="text-sm text-muted mt-1">Configure the CTA section displayed on the homepage</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Headline *</Label>
                                <Input value={ctaForm.headline} onChange={(e) => setCTAForm({ ...ctaForm, headline: e.target.value })} placeholder="Get Popeda Now" />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea value={ctaForm.description} onChange={(e) => setCTAForm({ ...ctaForm, description: e.target.value })} placeholder="Optional description text" rows={3} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Button Text</Label>
                                    <Input value={ctaForm.button_text} onChange={(e) => setCTAForm({ ...ctaForm, button_text: e.target.value })} placeholder="Buy Now" />
                                </div>
                                <div>
                                    <Label>Button URL</Label>
                                    <Input value={ctaForm.button_url} onChange={(e) => setCTAForm({ ...ctaForm, button_url: e.target.value })} placeholder="/products" />
                                </div>
                            </div>
                        </div>

                        <Button onClick={saveCTA} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save CTA
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="mission" className="mt-6">
                    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                        <div>
                            <h2 className="font-heading text-xl font-semibold">Mission Section</h2>
                            <p className="text-sm text-muted mt-1">Configure the mission/about section displayed on the homepage</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Heading *</Label>
                                <Input value={missionForm.heading} onChange={(e) => setMissionForm({ ...missionForm, heading: e.target.value })} placeholder="Our Mission" />
                            </div>
                            <div>
                                <Label>Paragraph *</Label>
                                <Textarea value={missionForm.paragraph} onChange={(e) => setMissionForm({ ...missionForm, paragraph: e.target.value })} placeholder="Describe your mission" rows={5} />
                            </div>
                            <div>
                                <Label>Image URL</Label>
                                <Input value={missionForm.image_url} onChange={(e) => setMissionForm({ ...missionForm, image_url: e.target.value })} placeholder="https://example.com/mission-image.jpg" />
                            </div>
                            {missionForm.image_url && (
                                <div className="rounded-lg overflow-hidden bg-secondary max-w-xs">
                                    <img
                                        src={missionForm.image_url}
                                        alt="Mission preview"
                                        className="w-full h-auto"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                                        }}
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>CTA Button Text</Label>
                                    <Input value={missionForm.cta_text} onChange={(e) => setMissionForm({ ...missionForm, cta_text: e.target.value })} placeholder="About Us" />
                                </div>
                                <div>
                                    <Label>CTA Button URL</Label>
                                    <Input value={missionForm.cta_url} onChange={(e) => setMissionForm({ ...missionForm, cta_url: e.target.value })} placeholder="/about" />
                                </div>
                            </div>
                        </div>

                        <Button onClick={saveMission} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Mission
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminContent;
