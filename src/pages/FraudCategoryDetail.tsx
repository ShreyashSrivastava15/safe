import { useParams, Link, Navigate } from "react-router-dom";
import { fraudCategories } from "@/data/fraudCategories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft, Play, Zap, Target, AlertTriangle, CheckCircle2, Search } from "lucide-react";

const FraudCategoryDetail = () => {
    const { id } = useParams<{ id: string }>();
    const category = fraudCategories.find((c) => c.id === id);

    if (!category) {
        return <Navigate to="/fraud-coverage" replace />;
    }

    return (
        <div className="container px-4 py-8 md:py-16 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs / Back button */}
            <Button asChild variant="ghost" className="hover:bg-primary/10 hover:text-primary -ml-4">
                <Link to="/fraud-coverage" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Fraud Coverage
                </Link>
            </Button>

            {/* Header Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <Shield className="h-8 w-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{category.name}</h1>
                        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed italic">
                            {category.description}
                        </p>
                    </div>
                    <Button asChild size="lg" className="bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 group">
                        <Link to={`/analyze?category=${category.id}`}>
                            <Play className="h-4 w-4 mr-2 fill-current" />
                            Run S.A.F.E. Analysis
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="px-4 py-1.5 bg-primary/10 text-primary border-primary/20 text-sm font-semibold flex items-center gap-2">
                        <Zap className="h-4 w-4" /> {category.detectionType} Pipeline
                    </Badge>
                    <Badge variant="outline" className="px-4 py-1.5 border-white/10 text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4" /> {category.detectionApproach}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Detection Scope */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-md">
                    <CardHeader className="border-b border-white/5 bg-white/5 py-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="h-5 w-5 text-primary" />
                            Supported Fraud Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ul className="space-y-3">
                            {category.supportedTypes.map((type, i) => (
                                <li key={i} className="flex items-start gap-3 text-foreground/80 group">
                                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <span className="group-hover:text-foreground transition-colors">{type}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Example Signals */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-md">
                    <CardHeader className="border-b border-white/5 bg-white/5 py-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Risk Signals Detected
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ul className="space-y-3">
                            {category.exampleSignals.map((signal, i) => (
                                <li key={i} className="flex items-start gap-3 text-foreground/80 group">
                                    <div className="h-5 w-5 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                    </div>
                                    <span className="group-hover:text-foreground transition-colors italic">{signal}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Technical Methodology */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary/5 to-transparent p-8 md:p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Shield className="h-48 w-48" />
                </div>
                <div className="relative z-10 space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Target className="h-7 w-7 text-primary" />
                        Our Detection Approach
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-semibold text-primary mb-2">Analysis Level</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {category.detectionApproach.split('+').map(part => part.trim()).join(' and ')} integrated into our multi-modal consensus engine.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary mb-2">Processing Mode</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Uses a {category.detectionType.toLowerCase()} pipeline to identify anomalies and malicious intent instantly.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary mb-2">Accuracy Guarantee</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Verified across billions of data points using Transformers and Isolation Forest models.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FraudCategoryDetail;
