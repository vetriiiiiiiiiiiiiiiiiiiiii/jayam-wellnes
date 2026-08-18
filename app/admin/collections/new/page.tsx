import { getProductsForBundle } from '@/app/admin/actions';
import CollectionForm from './CollectionForm';

export const metadata = {
  title: 'Create Collection | Miracle Tree Admin',
};

export default async function NewCollectionPage() {
  const availableProducts = await getProductsForBundle();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Collection</h1>
          <p className="text-muted-foreground">Build a new product bundle or collection.</p>
        </div>
      </div>
      <CollectionForm availableProducts={availableProducts} />
    </div>
  );
}
