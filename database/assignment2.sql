-- Query 1: Add Tony Stark information to account
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starknet.com', 'Iam1ronM@n');

-- Query 2: update Tony Stark account type to admin
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = '1';

-- Query 3: Delete Tony Start account
DELETE FROM public.account
WHERE account_id = '1';

-- Query 4: Update inventory description for GM Hummer
UPDATE public.inventory
SET inv_description =REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = '10'; 

-- Query 5: Select make and model from the "sport" category
SELECT inv_make, inv_model
FROM public.inventory i
join public.classification c on c.classification_id = i.classification_id
WHERE classification_name = 'Sport';

-- Query 6: update images and thumbnail to add /vehicles into file paths
UPDATE public.inventory
SET inv_image =REPLACE(inv_image, '/images', '/images/vehicles'), inv_thumbnail =REPLACE(inv_thumbnail, '/images', '/images/vehicles')