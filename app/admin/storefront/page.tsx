import db from "@/lib/db";
import { revalidatePath } from "next/cache";

// Ensure sections exist in DB
async function ensureSections() {
  const count = await db.homepageSection.count();
  if (count === 0) {
    await db.homepageSection.createMany({
      data: [
        {
          type: "hero",
          position: 1,
          content: JSON.stringify({
            heading: "Discover the Miracle of Moringa",
            subheading: "Premium organic moringa products sourced from the finest farms in Tamil Nadu. Elevate your daily wellness routine.",
            primaryButtonText: "Shop Collection",
            secondaryButtonText: "Our Story"
          })
        },
        {
          type: "values",
          position: 2,
          content: JSON.stringify({
            heading: "The Miracle Tree Standard",
            values: [
              { title: "100% Organic", desc: "Certified organic by USDA and India Organic" },
              { title: "Sustainably Sourced", desc: "Directly from farmers in Tamil Nadu" },
              { title: "Lab Tested", desc: "Rigorous quality control for purity" }
            ]
          })
        }
      ]
    });
  }
}

export default async function StorefrontEditorPage() {
  await ensureSections();
  const sections = await db.homepageSection.findMany({ orderBy: { position: 'asc' } });

  // Server Action to update section
  async function updateSection(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const content = formData.get('content') as string;
    const isEnabled = formData.get('isEnabled') === 'on';

    await db.homepageSection.update({
      where: { id },
      data: { content, isEnabled }
    });

    revalidatePath('/');
    revalidatePath('/admin/storefront');
  }

  return (
    <div className="p-8 max-w-[1000px] mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-900">Storefront Editor (CMS)</h1>
        <p className="text-gray-500 mt-2">Manage the content and layout of your live homepage.</p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => {
          const content = JSON.parse(section.content);
          
          return (
            <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-medium text-white capitalize">{section.type} Section</h2>
                <span className="text-xs font-medium text-gray-400">Position: {section.position}</span>
              </div>
              
              <form action={updateSection} className="p-6">
                <input type="hidden" name="id" value={section.id} />
                <div className="space-y-6">
                  
                  {/* Dynamically render inputs based on JSON keys */}
                  {Object.entries(content).map(([key, value]) => {
                    if (typeof value === 'string') {
                      return (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                          {value.length > 50 ? (
                            <textarea name={`content_${key}`} defaultValue={value} rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-gray-900 bg-white" />
                          ) : (
                            <input type="text" name={`content_${key}`} defaultValue={value} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-gray-900 bg-white" />
                          )}
                        </div>
                      );
                    }
                    return null; // Skip complex arrays/objects for now to keep it simple
                  })}

                  {/* We must reconstruct the JSON on submit. 
                      Since Next.js Server actions take raw FormData, let's use a hidden input that updates via client JS, 
                      or just let the user edit the raw JSON as a fallback for complex structures like values array. */}
                  
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Raw JSON Configuration (Advanced)</label>
                    <textarea 
                      name="content" 
                      defaultValue={section.content} 
                      rows={6} 
                      className="w-full font-mono text-xs border border-gray-300 rounded-lg p-4 bg-gray-50 text-gray-800"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id={`enabled_${section.id}`} name="isEnabled" defaultChecked={section.isEnabled} className="w-5 h-5 rounded border-gray-300 text-brand-green-600 focus:ring-brand-green-500" />
                      <label htmlFor={`enabled_${section.id}`} className="text-sm font-medium text-gray-900">Show on homepage</label>
                    </div>
                    <button type="submit" className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                      Save Section
                    </button>
                  </div>
                </div>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
